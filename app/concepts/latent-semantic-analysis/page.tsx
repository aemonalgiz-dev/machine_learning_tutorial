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
import { ComponentSpectrum } from "@/components/widgets/ComponentSpectrum";
import { LatentSpaceExplorer } from "@/components/widgets/LatentSpaceExplorer";
import { LeadingDirectionStrip } from "@/components/widgets/LeadingDirectionStrip";
import { NearestInOneSpace } from "@/components/widgets/NearestInOneSpace";
import { RebuiltRow } from "@/components/widgets/RebuiltRow";
import { SqueezeTradeoff } from "@/components/widgets/SqueezeTradeoff";
import { TermDocumentTable } from "@/components/widgets/TermDocumentTable";
import { TwoSensesOneRow } from "@/components/widgets/TwoSensesOneRow";

export const metadata: Metadata = {
  title: "Latent Semantic Analysis · Perceptron Lab",
  description:
    "A table of word use across documents can contain shared patterns. Latent semantic analysis keeps a smaller set of those patterns, representing words and documents with fewer coordinates.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function LatentSemanticAnalysisPage() {
  return (
    <ConceptPage
      lessonId="latent-semantic-analysis"
      intuition={lessonIntuitions["latent-semantic-analysis"]}
      technicalStart="Part 3. Squeezing The Table"
      openingTitle="A Large Word Table May Have a Smaller Pattern Inside It"
      playgroundTitle="What remains when we keep fewer directions?"
      playgroundIntro="Compare the original table with its weighted and reduced representations. Inspect neighboring words and documents as you change the number of retained directions."
      title="Latent Semantic Analysis"
      tagline={"A table of word use across documents can contain shared patterns. Latent semantic analysis keeps a smaller set of those patterns, representing words and documents with fewer coordinates."}
      prerequisites={
        <>
          Everything here ends as a handful of coordinates, and two of them are
          compared by the{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            cosine
          </Link>{" "}
          {" of their directions. The matrix decomposition is also used in "}{" "}
          <Link href="/concepts/pca" className={link}>
            principal component analysis
          </Link>{" "}

          performs, applied to a different table and with one step deliberately
          left out, and Part 4 is where that difference is measured rather than
          asserted. Nothing later depends on having read that page, though a
          reader who has will recognize most of Part 3 on sight.
        </>
      }

      playground={<LatentSpaceExplorer />}
      sections={[
        {
          title: "Part 1. One Table, Two Readings",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Twenty-four documents, and four small enough to print">
                <>
<p>
                  We will compare two collections. The larger has twenty-four documents, twelve about cooking and twelve about sailing. Cooking uses flour, sugar, butter, eggs, oven, bake, stir, whisk, dough and pan. Sailing uses sail, wind, boat, harbour, anchor, tide, mast, rope, deck and crew. The separate topic lists let us check whether the representation recovers the structure we put into the text.
                </p>
                <p>In this constructed collection, no content word appears in both topic lists. The shared words and, the and we occur across the two subjects, so their presence alone does not identify which subject a document belongs to.</p>
</>
                <p>Each six-word document contains five successive words from its topic&apos;s rotating list and one shared word. This controlled arrangement creates a known pattern for the experiment to recover. Natural documents can contain additional themes and relationships, so success here establishes only what happens under this construction.</p>
                <p>
                  The smaller collection is four documents of three words each,
                  the cat sat, the cat ran, the boat sailed and the boat sank.
                  It is here because every number that comes out of it can be
                  checked with a pencil, and because its whole table fits on the
                  screen at once.
                </p>
                <KeepInMind>
                  {"We know the constructed topic groups, but the fit receives only the word counts. Within-topic and cross-topic similarities let us check one consequence of the representation. They do not measure every aspect of retrieval quality."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. A row is a word and a column is a document">
                <p>
                  Put one word in each row and one document in each column. Each cell counts that word&apos;s occurrences in that document. This representation keeps frequencies but loses word order: the cat sat and sat the cat produce the same column. Reordering the document columns changes where we find them, but supplies no new information about their content.
                </p>
                <>
<p>The same table describes two kinds of object. A document column lists its word counts across the vocabulary. A word row lists its counts across the documents. Either can be treated as a vector, with its coordinates defined by the opposite axis.</p>
                <p>
                  Neither reading needs anything the other does not have, so a method that works on the table is answering both questions at once whether or not it meant to.
                </p>
</>
                <TermDocumentTable corpus="four" />
                <p>
                  Seven distinct words over four documents gives 28 cells, and
                  12 of them hold anything, so 57.1% of the table is empty even
                  at this size. The row of the is 1, 1, 1, 1, and the row of sat
                  is 1, 0, 0, 0. Those two rows are the two extremes the rest of
                  this page is about.
                </p>
                <KeepInMind>
                  {"Most cells are zero in these examples. Larger vocabularies and short documents can make the table much sparser still. That pattern motivates sparse storage, which records nonzero entries instead of allocating a value for every word–document pair."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Where a table of counts stops working">
                <p>
                  Take two documents from the cooking half, flour sugar and
                  butter eggs oven and we bake stir whisk dough pan. Both are
                  about cooking, both were written from the same ten words, and
                  by the cycle that built them they happen to share no word at
                  all. Compare their columns and the answer is exactly zero,
                  because two lists of numbers that are never both non-zero in
                  the same place have nothing to multiply together.
                </p>
                <p>
                  Now take that first document against a sailing one, sail wind
                  and boat harbour anchor. They share the word and, and nothing
                  else. The table rates that pair at 0.1483, which is higher than
                  the 0.0000 it gave the two cooking documents. Read literally,
                  the collection is saying that a document about cooking is more
                  like a document about sailing than it is like another document
                  about cooking.
                </p>
                <SqueezeTradeoff />
                <p>
                  This is not one unlucky pair. Of the 132 pairs of documents
                  drawn from one half, 14 come out at exactly nothing, and so do
                  96 of the 144 pairs that cross the halves. Among words the
                  clash is sharper. Ten of the 90 pairs taken from one half score
                  exactly zero, and the mean over every pair made of a cooking
                  word and a sailing word is exactly zero as well, so flour
                  against bake and flour against anchor are the same number and
                  the table cannot tell the two situations apart.
                </p>
                <KeepInMind>
                  {"Raw count cosine requires overlap in the selected coordinates. That can miss documents with related subjects but different wording. In 1990, Deerwester and colleagues described latent semantic indexing to address this retrieval problem: approximate the word–document table using shared patterns, so related terms can contribute even without exact word overlap."}
                </KeepInMind>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://www.microsoft.com/en-us/research/publication/indexing-by-latent-semantic-analysis/">{"Deerwester et al.: Indexing by Latent Semantic Analysis (1990)"}</Link></p>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. Weighting What A Count Is Worth",
          content: (
            <>
              <SubSection title="4. A word used in every document">
                <p>
                  Look again at the row of the in the four-document table. It
                  reads 1, 1, 1, 1. That row is a perfectly good description of
                  the word, in the sense that it is exactly what the collection
                  observed, and it is useless for telling one document from
                  another, because whatever question is asked of it the answer is
                  the same for all four columns.
                </p>
                <p>
                  In this example, the occupies a third of the raw count total in every document column. It contributes to comparisons, yet its identical counts cannot distinguish the documents. We need to consider how a shared frequent word affects similarity before treating the count vectors as descriptions of topic.
                </p>
                <KeepInMind>
                  {"The shared word contributes equally to all four document columns. In this example it occupies a third of each raw count total, without helping distinguish their topics. Weighting can reduce its influence relative to less widespread words."}
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Frequent here, rare elsewhere">
                <p>
                  {"Multiply each count by a weight based on how many documents contain the word. A high count retains repeated-use evidence within a document, while inverse-document frequency increases the relative weight of terms that occur in fewer documents. Neither frequency alone proves what a document is about."}
                </p>
                <Equation>{"weight(word) = log( (1 + documents) / (1 + documents holding the word) ) + 1"}</Equation>
                <p>
                  {"There are two separate adjustments here. Adding one to the document counts avoids a zero denominator and changes the ratio. Adding one outside the logarithm keeps a word found in every document at weight 1. Removing only the count smoothing would not remove that outer offset. The unsmoothed, unoffset alternative ln(N/df) gives an everywhere-present word weight 0."}
                </p>
                <WorkedExample title="Seven words, four documents">
                  <>
                    <p>
                      The occurs in every document, cat and boat in two each, and the
                      remaining four words in one each. Smoothed inverse-document
                      frequency assigns weights from those document counts.
                    </p>
                    <Equation>{"the:              ln(5/5) + 1 = 1\ncat, boat:        ln(5/3) + 1 ≈ 1.5108\nsat, ran, sailed, sank: ln(5/2) + 1 ≈ 1.9163"}</Equation>
                    <p>
                      Rare words gain weight relative to the shared word. Its numerical
                      row stays unchanged, but its share of each document’s total falls.
                    </p>
                  </>
                </WorkedExample>
                <p>
                  Switch the table in step 2 to weighted counts and watch what
                  stays put. Every cell that was empty is still empty, since a weight
                  multiplies a count and cannot create one, and every cell that
                  was filled is still filled. The weighting changes how loud each
                  row is and changes nothing about which cells the collection
                  ever wrote in, which is the limitation Part 6 comes back to.
                </p>
                <KeepInMind>
                  {"This formula retains an everywhere-present word at weight 1. The alternative ln(N/df) would give it weight 0. State both the smoothing and the outer offset when comparing implementations; different formulas need not produce the same representation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. What the weighting does on a larger collection">
                <p>
                  The weighting changes little on these twenty-four documents. No word appears everywhere. Each shared word appears in eight documents, and topic words appear in five to seven, giving weights from 2.0217 to 2.4271. The most frequent words therefore receive only a modest reduction relative to the others in this corpus.
                </p>
                <NumberTable
                  headings={[
                    "how a count is weighted",
                    "share of the first document taken by its shared word",
                  ]}
                  rows={[
                    ["plain counts", "16.7%"],
                    ["weighted counts", "15.7%"],
                  ]}
                  caption="Measured on the twenty-four documents. The word in question is and, which appears in eight of the twenty-four; on the four-document collection, where a word really does appear everywhere, the same two figures are 33.3% and 22.6%."
                />
                <p>
                  {"The weighting changes these topic comparisons only modestly. Switch between raw and weighted counts to inspect the difference. The smaller four-document collection, with the in every column, makes the effect of the formula easier to see."}
                </p>
                <KeepInMind>
                  {"Inverse-document frequency is useful when widespread words would otherwise dominate a comparison. Its effect depends on the distribution of document frequencies, rather than the presence of a fixed list of words such as the or is."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "The table of counts rates a cooking document against a sailing one higher than it rates two cooking documents against each other.",
              true,
              "The two cooking documents in this comparison share no words, so their count-vector cosine is zero. The cross-topic pair shares and and scores 0.1483. Direct document-word overlap therefore ranks these particular pairs poorly for the intended topic comparison. A different representation can use wider patterns of word and document relationships.",
            ),
            choice(
              "The mean over every pair made of a cooking word and a sailing word is exactly zero. Why is that worse than it sounds?",
              [
                "Ten of the 90 pairs taken from one half also score exactly zero, so flour against bake and flour against anchor are the same number",
                "Zero is the lowest the comparison can go, so nothing has been lost",
                "The mean is dragged down by the three words both halves use",
                "It shows the two halves were written from one vocabulary",
              ],
              0,
              "Zero overlap does not distinguish every kind of relationship we want to recognize. Some same-topic words also lack direct overlap in this constructed table. A zero cross-topic mean therefore does not establish that all topic relationships were captured. We need to inspect the same-topic comparisons as well.",
            ),
            trueFalse(
              "The row of the is uninformative, and being uninformative it is at least harmless.",
              false,
              "The appears in every one of these four documents, so its count does not distinguish their topics. It still contributes to their vector lengths and dot products, increasing the common component in each comparison. An uninformative feature for this particular distinction can therefore affect the ranking rather than remaining harmless.",
            ),
            choice(
              "Why do the additions inside the weighting formula matter?",
              [
                "Without them a word in every document gets a weight of exactly zero, which deletes its row, where the smoothed form hands it a weight of one",
                "They stop the weight going negative on a rare word",
                "They make the weights sum to one over the vocabulary",
                "They let a weight write a number into a cell the collection left empty",
              ],
              0,
              "The smoothing inside the logarithm and the offset outside it have different purposes. With N documents and df documents containing the term, the rule is:\n\n```math\nidf = log((N + 1) / (df + 1)) + 1\n```\n\nThe inner additions smooth the document-frequency ratio. The outer addition keeps a term present in every document at weight one instead of zero. Multiplying these weights by counts still leaves an observed zero count at zero.",
            ),
            trueFalse(
              "On the twenty-four documents the weighting makes a large difference to the comparisons.",
              false,
              "The three shared words occur in eight documents each, while topic words occur in five to seven. The resulting weights range only from 2.0217 to 2.4271, so this collection does not illustrate a large contrast between ubiquitous and rare terms. Compare the actual weighted and unweighted results rather than assuming that adding IDF must change them substantially.",
            ),
        ],
        },
        {
          title: "Part 3. Squeezing The Table",
          content: (
            <>
              <SubSection title="7. The closest table of a given rank">
                <p>
                  {"Singular-value decomposition, or SVD, expresses the matrix as a sum of paired patterns. Each pair has a direction across words, a direction across documents, and a scale called a singular value. Keep the largest k scales and their patterns to form a rank-at-most-k approximation. Here rank counts the independent paired directions retained."}
                </p>
                <Equation>{"X  =  U S Vᵀ,   and keeping the k largest gives   X(k) = U(k) S(k) V(k)ᵀ"}</Equation>
                <p>
                  Closest is meant strictly. Add up the squared difference
                  between every cell of the original and the corresponding cell
                  of the rebuild, and no other table of that rank scores lower.
                  The size of that error is known in advance too, since it is
                  exactly the sum of the squares of the numbers that were thrown
                  away.
                </p>
                <Equation>{"sum over every cell of ( X − X(k) )²  =  the sum of the discarded squared numbers"}</Equation>
                <WhyThisWorks title="Why the error is the discarded weight, exactly">
                  <>
<p>
                  {"The word directions are mutually orthogonal, as are the document directions. That makes the matrix components orthogonal under the sum-of-cell-products comparison. Their squared magnitudes therefore add without cross terms. It does not mean the components occupy different cells."}
                </p>
                  <p>
                    Dropping a piece removes its contribution and nothing else, which is why the error of the rebuild and the weight thrown away are one quantity rather than two that happen to agree. On the twenty-four documents at two directions kept, both are 371.3389.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  The method chooses its directions to make that squared error
                  as small as it can be, and nothing else. It is not asked to
                  find directions that mean anything, and Part 6 is about what
                  follows from that.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. What the squeeze fills in">
                <p>
                  A rebuilt table has entries in cells the collection never
                  wrote in, and that is the entire point rather than a side
                  effect. Take the row of flour. In the collection it holds a
                  weight in six of the twelve cooking documents and nothing
                  anywhere else. Keep two directions, rebuild, and the row holds
                  about 1.1 in all twelve cooking documents and no more than a
                  hundredth in any sailing one.
                </p>
                <RebuiltRow />
                <p>
                  {"The low-rank approximation gives flour nonzero weights in cooking documents where it never occurred. That follows from shared patterns in the table; it is not a newly observed word count or a verified claim that flour belongs in those documents."}
                </p>
                <p>

                  It also fills some of them in with numbers no count can be. At
                  two directions kept, 104 cells of the rebuild are below zero,
                  the least of them at −0.0149; at eight directions kept the
                  figures are 208 cells and −0.3643. Nothing in the arithmetic
                  forbids that, because the fit is minimizing a squared
                  difference over a whole table and has never been told that its
                  entries are counts.
                </p>
                <KeepInMind>
                  The rebuild is the closest table of low rank to what was
                  observed, which is a smaller claim than it sounds. The numbers
                  it puts where the collection was silent are what that closeness
                  costs, and they are not evidence about the word or the document
                  they sit between.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What each direction accounts for">
                <p>
                  Each kept direction carries a share of the table, its own
                  number squared over the total of every number squared. Those
                  shares are worth reading because they say how much a cut is
                  discarding, and because the shape of the sequence says whether
                  the collection has a few strong patterns in it or many weak
                  ones.
                </p>
                <ComponentSpectrum />
                <NumberTable
                  headings={[
                    "direction",
                    "its number",
                    "its share",
                    "the running total",
                  ]}
                  rows={[
                    ["1", "13.6994", "26.3%", "26.3%"],
                    ["2", "12.4510", "21.7%", "48.0%"],
                    ["3", "8.4582", "10.0%", "58.0%"],
                    ["4", "8.4500", "10.0%", "68.0%"],
                    ["5", "7.6517", "8.2%", "76.2%"],
                    ["6", "7.5307", "7.9%", "84.2%"],
                    ["8", "6.1192", "5.2%", "94.8%"],
                    ["14", "1.4763", "0.3%", "100.0%"],
                  ]}
                  caption="The twenty-four documents under weighted counts. The denominator is the total over every direction the table has, so a fit that keeps two of them reports 48.0% rather than claiming everything."
                />
                <p>
                  The last row is the one to notice. The running total reaches
                  the whole table at the fourteenth direction and never moves
                  again, because twenty-three words over twenty-four documents
                  arranged in this cycle leave only fourteen directions with any
                  spread in them at all. Asking for a fifteenth is asking for a
                  direction that accounts for nothing, and the coordinates every
                  word and document get on it are zero.
                </p>
                <KeepInMind>
                  The denominator has to be worked out before the truncation,
                  since afterwards the discarded numbers are gone and any fit
                  would report that it had kept everything. That is why a fit
                  keeping two directions here reports 48.0% and not 100%.
                </KeepInMind>
              </SubSection>

              <SubSection title="10. The two documents that shared no word, read again">
                <p>
                  Part 1 left two cooking documents rated at exactly nothing and
                  a cooking document rated above them by a sailing one. Rebuild
                  the table from two directions and compare the same pairs. The
                  two cooking documents come out at 0.9998 and the cross-half
                  pair falls to 0.0819, so the ordering has reversed and the
                  reversal is the method doing the job it was invented for.
                </p>
                <p>
                  {"Flour–bake rises from zero to about 1, while flour–anchor is near zero at −0.0028. The reduced representation distinguishes these pairs, but zero is not the opposite endpoint of the cosine range, which extends to −1."}
                </p>
                <InAModel title="On this collection">
                  <p>
                  {"The reported mean within-topic cosine rounds to 1.0000, while the cross-topic mean is 0.0021. These averages show strong topic separation in this construction. A rounded mean does not establish that every pair is exactly identical in direction."}
                </p>
                </InAModel>
                <KeepInMind>
                  Nothing here amounts to the fit having learned about cooking.
                  Flour and bake are used in documents that use the same other
                  words, so the same two directions account for both rows, and
                  describing both rows with those two directions is the whole of
                  what the rebuild did.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. The First Direction Cannot Separate Anything",
          content: (
            <>
              <SubSection title="11. Every document on the same side of nothing">
                <p>
                  {"Does the strongest singular direction separate the topics? In this balanced construction it does not. Inspect its coordinates rather than assuming that the largest contribution to squared magnitude must be the most useful topic distinction."}
                </p>
                <p>
                  {"For a nonnegative matrix, leading singular vectors can be chosen nonnegative. This follows by applying the nonnegative-matrix result to its Gram matrices. It rules out a required sign split on that chosen direction, but different positive magnitudes can still separate groups. Equal topic means in the example require its additional symmetry."}
                </p>
                <LeadingDirectionStrip />
                <p>
                  Measured on the twenty-four documents, every coordinate on the
                  leading direction lies between 2.6501 and 2.8994, and the two
                  halves&rsquo; means come out at 2.7948 and 2.7948, differing by
                  4.4 times ten to the minus sixteen, which is the last bit of a
                  double-precision number rather than a difference. That
                  direction carries 26.3% of the table, more than any other, and
                  it says nothing whatever about which half a document is in.
                </p>
                <KeepInMind>
                  {"Here the leading coordinate largely tracks a common count pattern, and the two topic means coincide. That is a result of this balanced example. In another collection, a leading coordinate could also carry topic information."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The direction after it does the separating">
                <p>
                  Switch the strip above to the second direction. Every cooking
                  document is now negative and every sailing document positive,
                  with the two means at −2.5388 and 2.5388, and no document is
                  anywhere near the line. The split the first direction could not
                  make is complete on the second, which carries 21.7% of the
                  table.
                </p>
                <p>
                  The words agree with the documents, since they came out of the
                  same decomposition. The three words both halves use, and, the
                  and we, have second coordinates of zero to fifteen decimal
                  places, which is the fit saying that a word used equally on
                  both sides has no position on the direction that tells the
                  sides apart. Every cooking word is on one side of them and
                  every sailing word on the other.
                </p>
                <WorkedExample title="The four-document collection, by hand">
                  <>
<p>
                    For the smaller count table, the singular values are the square roots of 7, 3, 1 and 1. Their squared shares are seven twelfths, three twelfths, one twelfth and one twelfth. All four documents have the same first coordinate, approximately 1.3229. Keeping only that coordinate would discard the differences between the pairs, despite retaining the largest share of the squared magnitude.
                  </p>
                  <p>
                  {"On the second direction of this symmetric four-document example, the cat and boat pairs take opposite values. The shared word the has coordinate 0 there. Appearing in every document would not force that coordinate to zero under every possible count pattern."}
                </p>
</>
                </WorkedExample>
                <WhyThisWorks title="Where 7, 3, 1 and 1 come from, with a pencil">
                  <p>
                    Count, for every pair of the four documents, how many
                    words the two share. A document shares all three of its
                    words with itself, the two cat documents share two, the two
                    boat documents share two, and a cat document and a boat
                    document share only the word the.
                  </p>
                  <Equation>{`                  the cat sat   the cat ran   the boat sailed   the boat sank
the cat sat            3             2               1                1
the cat ran            2             3               1                1
the boat sailed        1             1               3                2
the boat sank          1             1               2                3`}</Equation>
                  <p>
                  {"Try four document patterns: all documents together, cat documents against boat documents, one cat document against the other, and one boat document against the other. These are eigenvectors of the document Gram matrix after normalization. Their eigenvalues are the squared singular values. The sums below show the nonzero row contributions for each pattern."}
                </p>
                  <Equation>{`every document alike              3 + 2 + 1 + 1  =  7
cat pair against boat pair        3 + 2 − 1 − 1  =  3
one cat document against the other        3 − 2  =  1
one boat document against the other       3 − 2  =  1`}</Equation>
                  <p>
                    The largest belongs to the pattern with no minus sign in
                    it, which is Perron&rsquo;s theorem on four documents, and
                    the next to the pattern that tells the halves apart. The
                    four add up to 12, the number of filled cells in a table
                    whose every filled cell holds a 1, and that is where the
                    twelfths come from. The pattern with every document alike,
                    scaled to length one, puts a half on each of the four, and
                    a half of the square root of 7 is the 1.3229 above.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"Two directions are needed for cosine to distinguish these topics: one positive scalar coordinate gives every nonzero document the same direction. That does not make a one-component approximation useless for every purpose; scalar magnitudes can still differ in another dataset."}
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Subtracting each word’s mean first">
                <p>

                  PCA centers its input before decomposition, while this LSA calculation does not. Let&apos;s center the same table once and compare the result. That will show which variation is being summarized under each choice.
                </p>
                <p>
                  Subtract from every row its own mean across the documents and
                  decompose what is left. The leading direction is now the
                  separating one, with the cooking half at 2.5388 and the sailing
                  half at −2.5388, and it carries 29.4% of the table against the
                  26.3% the unshifted leading direction carried. Every negative
                  entry the shift introduced is what makes the sign change
                  possible, and Perron no longer applies because the matrix is no
                  longer non-negative.
                </p>
                <NumberTable
                  headings={[
                    "the table",
                    "the leading direction’s share",
                    "the two halves on it",
                    "one mean minus the other",
                  ]}
                  rows={[
                    ["as counted", "26.3%", "2.7948 and 2.7948", "4.4 × 10⁻¹⁶"],
                    ["after shifting", "29.4%", "2.5388 and −2.5388", "5.0777"],
                  ]}
                  caption="The same weighted table, decomposed before and after centering. The topic split becomes the leading direction. The preparation, retained shares and reconstruction interpretation also change, so this is not otherwise an identical fit."
                />
                <>
<p>
                  {"This LSA implementation decomposes uncentered weighted counts. Its reconstructed entries approximate those same weighted counts, and its fold-in rule uses that preparation. A centered decomposition instead describes deviations from stored training means. It can also reconstruct counts and place new documents if those means are retained and applied consistently. The two choices summarize different structure."}
                </p>
                <p>
                  {"Explicitly subtracting each row mean usually makes formerly zero cells nonzero. Materializing that centered table can therefore lose sparse-storage savings. Some algorithms apply centering implicitly, so a dense allocation is not inevitable."}
                </p>
</>
                <KeepInMind>
                  The two methods are the same arithmetic applied to different
                  tables, and the choice of table is where they part company. A
                  reader arriving from the other page should expect the leading
                  direction here to behave unlike the leading component there,
                  since one of them was computed after a shift that the other
                  never performs.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            trueFalse(
              "The squared error of a rebuild and the weight that was thrown away are one quantity, not two that happen to agree.",
              true,
              "Orthogonality lets squared matrix magnitude separate into contributions from the singular directions. For the truncated SVD, the reconstruction error is exactly the discarded contribution in exact arithmetic.\n\n```math\nsummed squared reconstruction error = sum of discarded singular values squared\n```\n\nBoth reported values are 371.3389 when two directions are retained. Floating-point computation can introduce a small numerical residual without changing the identity.",
            ),
            choice(
              "Rebuilt from two directions, the row of flour holds about 1.1 in all twelve cooking documents where the collection used it in six. What should be made of that?",
              [
                "It is a value in a low-rank weighted-matrix approximation, rather than a newly observed occurrence count",
                "It shows the fit has learned what cooking is",
                "It is a rounding artifact of keeping too few directions",
                "It means flour really was used in all twelve and the counts were lost",
              ],
              0,
              "The reconstruction approximates a weighted real-valued matrix; it is not constrained to generate nonnegative integer counts. With two directions, originally zero cells average 0.4043 and the largest becomes 1.2970, while 104 reconstructed cells are negative. These values describe the low-rank approximation, not newly observed word occurrences. Their usefulness needs to be judged through the later task.",
            ),
            several(
              "Which of these hold for the twenty-four documents once the table has been squeezed?",
              [
                              "A fit keeping two directions reports 48.0 percent of the table, a share whose denominator was worked out before the cut",
                              "The two cooking documents that share no word come out at 0.9998, above the 0.0819 of the cooking and sailing pair that share one",
                              "Flour against bake and flour against anchor, both exactly zero in the table as counted, come out at 1.0000 and −0.0028",
                              "The running total of the shares reaches the whole table at the fourteenth direction and never moves again",
                            ],
              [0, 1, 2, 3],
              "A retained share needs the original full squared magnitude as its denominator. Recomputing that denominator from only the retained factors would make their shares total one by construction. The observed word and document reversals show what this particular lower-rank representation changes. The controlled matrix has fourteen nonzero singular directions; that is a rank statement rather than evidence of fourteen named subjects.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "direction | its number | its share | the running total\n1 | 13.6994 | 26.3% | 26.3%\n2 | 12.4510 | 21.7% | 48.0%\n3 | 8.4582 | 10.0% | 58.0%\n4 | 8.4500 | 10.0% | 68.0%\n5 | 7.6517 | 8.2% | 76.2%\n6 | 7.5307 | 7.9% | 84.2%\n8 | 6.1192 | 5.2% | 94.8%\n14 | 1.4763 | 0.3% | 100.0%\n\nWith two directions kept:\nTwo cooking documents sharing no word: cosine 0.9998\nCooking/sailing documents sharing a word: cosine 0.0819\nWord pairs with zero observed co-occurrence:\nflour/bake: cosine 1.0000; flour/anchor: cosine −0.0028\nAll directions after direction 14 have zero singular value.\nShares use squared singular values before truncation."
              },
            ),
            choice(
              "Why can this nonnegative table’s unique leading singular direction be chosen with one sign across its document coordinates?",
              [
                "A leading singular vector of a nonnegative matrix can be chosen nonnegative; uniqueness here leaves only an overall sign choice",
                "That direction carries too small a share of the table to say anything",
                "The weighting flattens it",
                "The three shared words cancel along it",
              ],
              0,
              "In this example, the leading direction describes information shared across the documents. Its coordinates all have the same sign and range from 2.6501 to 2.8994; the topic means differ only at rounding precision. It accounts for 26.3 percent of squared matrix magnitude. The next direction separates the constructed topics. The largest singular component need not be the task's most useful separator.",
            ),
            several(
              "Each row is shifted by its own mean across the documents before decomposing. Which of these follow?",
              [
                              "The leading direction becomes the separating one, carrying 29.4 percent against the unshifted leading direction’s 26.3",
                              "Perron no longer applies, because the matrix is no longer non-negative",
                              "A rebuilt entry is still a guess at a weight some document gave a word",
                              "Every empty cell is filled with the negative of a row mean, so a table that is 73.9 percent empty stops being sparse",
                            ],
              [0, 1, 3],
              "Subtracting a row mean turns each zero into a negative deviation, so the previously sparse matrix becomes dense. The leading direction in this centered experiment separates the groups. Reconstructing without adding the means back gives deviations, not the original weighted counts. A centered model can still process new documents if it retains and applies the training means consistently; that is a different preparation rule from this uncentered LSA implementation.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "the table | the leading direction’s share | the two halves on it | one mean minus the other\nas counted | 26.3% | 2.7948 and 2.7948 | 4.4 × 10⁻¹⁶\nafter shifting | 29.4% | 2.5388 and −2.5388 | 5.0777\n\nBefore centring, 73.9% of word/document cells are zero.\nReplace each entry Aᵢⱼ by Aᵢⱼ − mean(row i), including zero entries.\nReconstruct the centred matrix without adding those row means back."
              },
            ),
        ],
        },
        {
          title: "Part 5. A Position For Every Word And Every Document",
          content: (
            <>
              <SubSection title="14. Two questions from one fit">
                <p>
                  {"The decomposition supplies word and document directions. Multiplying each set by the retained singular values gives the coordinates used here for word–word and document–document comparisons. They share component indices, but the dot product between these two scaled representations does not directly reconstruct a word’s original document count."}
                </p>
                <Equation>{"position of a word = U(k) S(k)        position of a document = V(k) S(k)"}</Equation>
                <p>
                  {"The scaled word vectors reproduce pairwise dot products between rows of the reconstructed matrix; the scaled document vectors do the same for its columns. The fitting objective minimizes matrix reconstruction error, rather than directly optimizing every cosine or semantic judgment."}
                </p>
                <NearestInOneSpace />
                <p>
                  At six directions kept, the words nearest flour are sugar at
                  0.8777, pan at 0.8561, butter at 0.6810, then the shared word
                  and at 0.6756, then dough at 0.6193, and the documents nearest
                  the first one are flour sugar butter the eggs oven at 0.9963,
                  pan flour and sugar butter eggs at 0.9161 and sugar butter eggs
                  the oven bake at 0.8686. The first of those shares five
                  content words with the first document and the other two share
                  four each, which is the ordering anybody would have written by
                  hand.
                </p>
                <KeepInMind>
                  {"LSA supplies representations for the fitted words and documents through one decomposition. Other methods can also learn both kinds of representation, so this is a property of this construction rather than a unique capability."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. Where a squeeze this hard loses more than it keeps">
                <p>
                  {"With two components, cooking-word cosine values lie between 0.9999 and 1.0000. The representation retains topic membership but leaves little angular distinction within the topic. It can still retain different vector magnitudes, and the tiny score differences are not literally one identical value."}
                </p>
                <p>
                  {"The original count vectors retain a wider range of within-topic cosine scores than this two-component version. Reducing rank has removed distinctions that may matter for a later query. Decide whether that loss is acceptable from the intended retrieval task."}
                </p>
                <NumberTable
                  headings={[
                    "the reading",
                    "squared-magnitude share retained",
                    "angles inside a half, smallest to largest",
                    "mean angle across the halves",
                  ]}
                  rows={[
                    ["the table itself", "everything", "0.0000 to 0.8571", "0.0000"],
                    ["2 directions kept", "48.0%", "0.9999 to 1.0000", "0.0021"],
                    ["4 directions kept", "68.0%", "0.1247 to 1.0000", "0.0000"],
                    ["6 directions kept", "84.2%", "0.0727 to 0.9553", "0.0000"],
                    ["12 directions kept", "99.2%", "0.0030 to 0.8692", "0.0000"],
                    ["23 directions kept", "100.0%", "0.0000 to 0.8571", "0.0000"],
                  ]}
                  caption="The twenty-four documents under weighted counts. The last row keeps every direction, so the rebuild is the table again and the angles agree with the first row to nine decimal places, which is the agreement test for the whole procedure."
                />
                <p>

                  Six directions is where both things are true at once, with the
                  halves still apart at 0.0000 across and the words of one half
                  spread from 0.0727 to 0.9553. Nothing computed during the fit
                  turns over as the width passes that value, and the shares in
                  step 9 do not point at it either, since they fall smoothly. The
                  width is a judgment made from outside.
                </p>
                <KeepInMind>
                  Reading the table directly is the obvious alternative to
                  fitting it, and at this size it wins on one of the two
                  questions. It orders the words of one half where a hard squeeze
                  cannot, and it fails completely at the question the method was
                  invented for, which is the pair that never met.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. A new document, placed without refitting">
                <p>
                  A collection that has been fitted once should not have to be
                  fitted again to say where a new text belongs. Weight the new
                  text&rsquo;s counts over the vocabulary already fitted, then
                  multiply by the directions over the words, and the answer is a
                  position in the same space as everything else.
                </p>
                <Equation>{"position of a new document = U(k)ᵀ x,   with x weighted by the fitted weights"}</Equation>
                <p>
                  The weights have to be the fitted ones rather than weights
                  recomputed from the new text, since a word&rsquo;s weight is a
                  statement about the collection and a single new document would
                  say that every word in it is equally rare. Applied to a
                  document that was in the fit, the same arithmetic returns
                  exactly the position that document already had, which is how
                  the two routes are held together.
                </p>
                <WorkedExample title="Three texts handed to the fitted space">
                  <>
<p>
                    We bake the dough and whisk the eggs lands at 3.7471 on the first direction and −1.9689 on the second, which is the cooking side. The crew sail the boat past the harbour lands at 3.3330 and 2.0586, which is the sailing side, and the word past is simply ignored because the collection never contained it.
                  </p>
                  <p>
                  {"A quiet afternoon produces a zero position because none of its words is in the fitted vocabulary. Cosine has no defined direction there. The interface needs to report that case or use an explicit fallback, rather than interpret zero as an ordinary search vector."}
                </p>
</>
                </WorkedExample>
                <p>
                  Type a text into the box under the playground to try this. A
                  text built from cooking words appears among the cooking
                  documents and one built from sailing words among the sailing
                  ones, and a text built from words the collection never saw
                  appears at the origin with a note saying why.
                </p>
                <KeepInMind>
                  Folding in is not refitting. The directions were chosen by the
                  original collection and a folded document is described in
                  terms of them, so a new document about something the collection
                  never covered gets a position that says how much it looks like
                  the subjects that were covered, which may be very little.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. The storage and computation behind the decomposition" id="17-what-it-costs">
                <p>
                  {"A compact factorization stores the retained word directions, document directions and singular values. Count those values against the original dense table. This is one storage layout; an implementation may retain additional copies, vocabulary mappings or working arrays."}
                </p>
                <Equation>{"At k = 2: 23×2 + 24×2 + 2 = 96 values\nAt k = 6: 23×6 + 24×6 + 6 = 288 values\nDense original: 23×24 = 552 values"}</Equation>
                <NumberTable
                  headings={[
                    "what is stored",
                    "numbers",
                    "squared-magnitude share retained",
                  ]}
                  rows={[
                    ["the whole table", "552", "100.0%"],
                    ["2 directions", "96", "48.0%"],
                    ["4 directions", "192", "68.0%"],
                    ["6 directions", "288", "84.2%"],
                  ]}
                  caption="Twenty-three words across twenty-four documents. The factorized representation saves storage only at sufficiently small widths."
                />
                <Equation>{"factorized storage = 23k + 24k + k = 48k values\noriginal table = 23 × 24 = 552 values"}</Equation>
                <p>
                  {"Dense input storage grows with vocabulary size times document count, while the compact factors grow roughly with their sum times k. That can be a substantial saving at small k. Compare with sparse input storage as well, since real count tables often contain many zeros."}
                </p>
                <KeepInMind>
                  {"This example uses a full SVD of a dense matrix. Larger collections often use sparse input and algorithms that approximate only the leading components. Their cost and accuracy depend on the algorithm, retained width and stopping settings; they need not reproduce a full dense SVD bit for bit."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Checking What the Smaller Representation Has Lost", id: "part-6-where-latent-semantic-analysis-stops-being-defined",
          content: (
            <>
              <SubSection title="18. A zero is a silence, and the fit reads it as a number">
                <p>
                  {"A zero count records that the word did not appear in the document. It does not tell us whether another word could express a related idea. Those are different statements: the count is observed, while semantic relevance remains a question for the representation and task."}
                </p>
                <p>
                  {"SVD includes zero-valued cells in the squared reconstruction objective. Assigning a nonzero reconstruction to one incurs an error contribution even when that value would be useful for retrieval. The model trades those errors against the rest of the table under its rank constraint."}
                </p>
                <p>
                  {"Ignoring selected cells would define a different objective, closer to some matrix-completion settings. The ordinary truncated-SVD solution no longer follows for arbitrary missing entries. Here the entries are observed counts, including zeros; the uncertainty concerns their relevance to a retrieval query."}
                </p>
                <KeepInMind>
                  The rebuild puts 0.4043 on average into the cells the
                  collection left empty, and the fit arrived at those numbers
                  while being told the true value in each of them was zero. Both
                  statements are true at once, and neither is evidence that the
                  filled-in number is right.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. The directions are chosen for spread">
                <p>
                  The directions are chosen to account for as much of the
                  table&rsquo;s squared size as possible, and that is a statement
                  about where the numbers vary, not about what anyone wants to
                  know. Nothing in the procedure looks at a subject, a label or a
                  question. The strongest direction on this collection carries
                  26.3% of the table and measures how much common vocabulary a
                  document uses.
                </p>
                <p>
                  So a direction describes whatever the collection happened to
                  vary along. Assemble a collection where every document is
                  about one subject and differs only in length, and the leading
                  directions describe length; assemble one where half the
                  documents were transcribed by a different typist, and they may
                  describe the typist. The method has no way to prefer one of
                  those to another, and a fit gives no sign that it has found
                  something uninteresting.
                </p>
                <>
<p>
                  {"When singular values are tied, the corresponding singular-vector basis is not unique: the paired directions can rotate together without changing the reconstructed matrix. Even with distinct values, paired sign flips are possible. A coordinate may correlate with an interpretable pattern, but its sign and basis conventions must be stated."}
                </p>
                <p>
                  Each direction is also determined only up to a sign, since flipping a word direction and its matching document direction together leaves everything the fit says unchanged.
                </p>
</>
                <KeepInMind>
                  Anything read off these coordinates has to survive a sign flip
                  and, where numbers are tied, a rotation. An angle between two
                  words survives both; the value of one coordinate survives
                  neither, and neither does a comparison of one fit&rsquo;s third
                  coordinate with another&rsquo;s.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. One row per spelling">
                <p>
                  The table has one row for each distinct spelling, so a word
                  used for two unrelated things contributes both sets of company
                  to one row and gets one position. There is no second position
                  for the second sense to occupy, because there is no second row.
                </p>
                <p>
                  This is where the method states the limitation most plainly of
                  anything on these pages, since the row is right there to look
                  at. Take the running collection and respell one cooking word
                  and one sailing word as roll, a bread roll in one half and the
                  roll of a boat in the other. Nothing else changes.
                </p>
                <TwoSensesOneRow />
                <p>
                  {"In this constructed merge, roll’s neighbors mix the shared words, and its cosine scores to flour and sail are 0.7219 and 0.7050. One row combines evidence from both uses. Its position reflects this fit; ambiguous words are not generally forced to a geometric midpoint."}
                </p>
                <KeepInMind>
                  Matching by word fails in two directions, and the 1990 paper
                  is explicit that it addresses one of them. A request missing a
                  document because the two chose different spellings is what the
                  squeeze repairs; a request reaching a document because the two
                  shared a spelling used for different things is left exactly
                  where it was.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Empty documents and directions with no variation" id="21-the-cases-with-nothing-to-compute">
                <p>A zero row cannot provide a direction, and a requested component may have no variation to describe. Check those cases before interpreting a low-dimensional comparison.</p>
                <DerivationTable
                  expressionHeading="Document, word or rank condition"
                  reasonHeading="Effect on the reduced representation"
                  rows={[{"expression":"a cell holding zero","reason":"Zero is an observed word count. Reconstruction error includes it, but it does not establish whether the document expresses a related concept using other words."},{"expression":"a document holding no word of the vocabulary","reason":"its column is entirely zero, so its position is the origin. The origin has no direction, so the angle between it and anything else is a zero divided by a zero and is undefined; a rank ordering of what such a document resembles does not exist rather than being empty."},{"expression":"a word absent from the collection","reason":"This vocabulary has no fitted row for the word. The implementation ignores it when folding in a document; another system could use a documented unknown-word policy."},{"expression":"asking for more directions than the table has","reason":"undefined. A table of m words by n documents has at most the smaller of m and n directions, so a twenty-third is the last one twenty-three words over twenty-four documents can offer and a twenty-fourth names something that is not there."},{"expression":"asking for more directions than the table varies along","reason":"permitted, and empty. Rows that repeat one another leave directions accounting for exactly nothing, and this collection has twenty-three, of which only fourteen carry any spread, so directions fifteen and up hand every word and every document a coordinate of zero and are settled by the arithmetic rather than by the data."},{"expression":"keeping exactly one direction","reason":"With positive one-dimensional coordinates, cosine gives every pair similarity1. This example therefore loses its topic split at k=1. Other applications can still use the scalar magnitude."},{"expression":"two directions of equal strength","reason":"The tied singular subspace is determined, but its basis can rotate with the matching factors. Comparisons invariant to that rotation remain meaningful; coordinate interpretation needs a stated basis."},{"expression":"the sign of a direction","reason":"undetermined. Flipping a word direction together with its matching document direction leaves the rebuild identical, so a fit reports one of two equally correct answers and which one it reports is settled by the arithmetic. A cosine between two words comes through that flip unchanged, since both coordinates change sign together, and the value of a single coordinate does not."},{"expression":"a word appearing in every document","reason":"The unoffset ln(N/df) weight is zero when df=N. This page’s count-smoothed formula also adds1 outside the logarithm, retaining weight1. The outer offset, not count smoothing alone, causes that difference."},{"expression":"a collection of one document","reason":"A one-document matrix has rank at most1. It supplies little evidence about relationships across documents; some scalar comparisons remain defined even though cosine directions collapse for positive entries."},{"expression":"a rebuilt entry below zero","reason":"Negative entries are permitted but not inevitable in a low-rank approximation. Here they occur because the unconstrained squared-error objective does not require reconstructed weighted counts to be nonnegative."},{"expression":"how many directions to keep","reason":"a real choice with nothing inside the fit to settle it. Too few and every word of a subject is forced onto one position, measured here as every pair inside a half sitting between 0.9999 and 1.0000; too many and the fit reproduces the table it was compressing, exactly so at full width. No quantity computed during the fit turns over as the width passes a good value."},{"expression":"which of two words stood first","reason":"outside what the table represents. A cell counts occurrences within a document and nothing else, so the cat sat and sat the cat give one column, and no fit of the table can recover an order that was discarded before the fit began."},{"expression":"which sense of a word is meant","reason":"One row combines the spelling’s contexts and does not select a different sense per occurrence. This merged example gives similar scores to both topics, but that outcome is not a universal midpoint rule."}]}
                />
                <KeepInMind>
                  {"The approximation minimizes squared error on the supplied count table. It does not directly optimize semantic relevance, and the rank limit can discard useful distinctions. Evaluate the reconstructed representation with the retrieval questions it is intended to answer."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            trueFalse(
              "Keeping two directions separates the halves and orders the words inside a half at the same time.",
              false,
              "Two retained directions separate the broad groups but make many within-group vectors nearly parallel. Cooking-word cosines lie between 0.9999 and 1.0000 in this comparison, so the cosine ranking retains little distinction among those words. More directions restore some differences while changing other similarities. The useful width depends on which distinctions the application needs, not only on how cleanly the two groups separate.",
            ),
            trueFalse(
              "The fit treats a cell the collection left empty as an observation of the value zero, and is penalized for placing anything else there.",
              true,
              "The 408 zero cells record that the word did not occur in that document. They are observed zeros in the count table, not missing measurements. The SVD objective includes their squared errors just like other cells. A positive reconstructed value can reflect a shared latent pattern, but does not establish that the word actually occurred or should have occurred. Evaluate that approximation for the intended comparison task.",
            ),
            choice(
              "A new text is folded into a fitted collection. Which weights are used on its counts?",
              [
                "The fitted ones, since a word’s weight is a statement about the collection and a single new document would say every word in it was equally rare",
                "Weights recomputed from the new text, so that it is described on its own terms",
                "None, since the new text took no part in the fit",
                "The weights belonging to the nearest fitted document",
              ],
              0,
              "New counts use the vocabulary, weighting statistics and directions retained from training. Transforming a training document reproduces its fitted coordinates up to numerical rounding. A text containing no recognized words transforms to the zero vector. Euclidean distance from that vector remains defined, while cosine has no direction to compare. Neither result supplies evidence about the omitted words' subject.",
            ),
            several(
              "Which of these survive the indeterminacies of the decomposition?",
              [
                              "An angle between two words",
                              "The value of a single coordinate",
                              "A comparison of one fit’s third coordinate with another’s",
                              "The rebuild itself, under a rotation of two directions of equal strength",
                            ],
              [0, 3],
              "Flipping a singular direction and its matching factor together leaves reconstruction unchanged. Equal singular values also permit a shared rotation within their subspace. In the four-document example, the third and fourth singular values are both one, so their individual axes are not uniquely determined by the data. The subspace and reconstructed relationships can remain well defined despite that choice of basis.",
              {
                "description": "A decomposition may flip a singular direction and its matching coefficient signs together. Inside a block of equal singular values, it may rotate both matching factors together. Apply these changes consistently to the same retained subspace. Compare its reconstruction and within-fit vector angles."
              },
            ),
            choice(
              "One cooking word and one sailing word are respelled roll, and nothing else changes. Where does roll land?",
              [
                "At zero on the direction that separates the halves, 0.7219 from flour and 0.7050 from sail",
                "Among the cooking words, since that half comes first in the table",
                "At the origin, since the fit cannot place a word with two senses",
                "At two positions, one for each sense",
              ],
              0,
              "In this constructed corpus, roll combines contexts from the two replaced words and sits at zero on the topic-separating direction. Its nearest neighbors are shared-context words with cosines 1.0000, 0.9997 and 0.9997. One stored row cannot provide separate contextual vectors for the senses, but ambiguous words are not generally forced to the exact midpoint of two meanings.",
            ),
        ],
        },
        {
          title: "Practice. Squeezing A Table With The Library",
          practice: [
            exercise(
              "Decompose the four documents under plain counts",
              [
  "Fit the four supplied documents with plain-count weighting and all four singular directions.",
  "Print squared singular values, their shares of total squared matrix magnitude, the first two coordinates of each document and the’s first two word coordinates. Keep document order fixed."
],
              `from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
)
from oop_ml.core.natural_language_processing.embeddings.counts.term_document import (
    TermWeighting,
)

four = ["the cat sat", "the cat ran", "the boat sailed", "the boat sank"]

# Build LatentSemanticAnalysis with dimension=4 and
# weighting=TermWeighting.COUNT, and fit it to the four texts.

# Print each of singular_values squared, and each of variance_shares.

# For each text, print the first two numbers of its document vector.

# Print the first two coordinates of the word "the".`,
              `from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
)
from oop_ml.core.natural_language_processing.embeddings.counts.term_document import (
    TermWeighting,
)

four = ["the cat sat", "the cat ran", "the boat sailed", "the boat sank"]

model = LatentSemanticAnalysis(dimension=4, weighting=TermWeighting.COUNT).fit(four)
print("squares", [round(float(value) ** 2, 4) for value in model.singular_values])
print("shares ", [round(share, 4) for share in model.variance_shares])

for place, text in enumerate(four):
    first, second = model.document_vectors.vector_of(place)[:2]
    print(f"{text:15s} {first:.4f} {second:.4f}")

first, second = model.embeddings.vector_of("the").values[:2]
print(f"{'the':15s} {first:.4f} {second:.4f}")`,
              `squares [7.0, 3.0, 1.0, 1.0]
shares  [0.5833, 0.25, 0.0833, 0.0833]
the cat sat     1.3229 0.8660
the cat ran     1.3229 0.8660
the boat sailed 1.3229 -0.8660
the boat sank   1.3229 -0.8660
the             2.0000 0.0000`,
              { hints: [
  "These shares describe an uncentered term-document decomposition, not variance after subtracting feature means.",
  "Inspect document_vectors and word embeddings separately; their coordinates have different roles in the factorization."
], check: numberCheck("At what value do the two cat documents sit on the second direction, to four places?", 0.866, 5e-05, "The cat documents have coordinate 0.8660 on this chosen second-axis orientation. That direction separates their pair from the boat pair in this fitted decomposition."), question: "Which directions describe the common words and which separate the document groups?" },
            ),
            exercise(
              "Squeeze the twenty-four documents at three widths",
              [
  "Fit the supplied twenty-four documents at widths two, four and six with the same default weighting.",
  "For each print retained squared-magnitude share, the supplied flour word-pair cosines and document-pair cosines for the first/sixth and first/thirteenth documents. Compare topic separation with distinctions inside a topic."
],
              `from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
)

cooking = [
    "flour sugar and butter eggs oven",
    "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir",
    "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough",
    "we bake stir whisk dough pan",
    "stir whisk and dough pan flour",
    "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter",
    "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven",
    "we sugar butter eggs oven bake",
]
sailing = [
    "sail wind and boat harbour anchor",
    "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast",
    "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck",
    "we tide mast rope deck crew",
    "mast rope and deck crew sail",
    "rope deck crew the sail wind",
    "we deck crew sail wind boat",
    "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor",
    "we wind boat harbour anchor tide",
]
documents = cooking + sailing

for dimension in (2, 4, 6):
    # Fit a model keeping this many directions. Print the sum of its
    # variance_shares, the similarity of flour with bake, sugar and anchor
    # from its embeddings, and the similarity of document 0 with documents
    # 5 and 12 from its document_vectors.
    ...`,
              `from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
)

cooking = [
    "flour sugar and butter eggs oven",
    "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir",
    "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough",
    "we bake stir whisk dough pan",
    "stir whisk and dough pan flour",
    "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter",
    "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven",
    "we sugar butter eggs oven bake",
]
sailing = [
    "sail wind and boat harbour anchor",
    "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast",
    "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck",
    "we tide mast rope deck crew",
    "mast rope and deck crew sail",
    "rope deck crew the sail wind",
    "we deck crew sail wind boat",
    "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor",
    "we wind boat harbour anchor tide",
]
documents = cooking + sailing

for dimension in (2, 4, 6):
    model = LatentSemanticAnalysis(dimension=dimension).fit(documents)
    words = model.embeddings
    texts = model.document_vectors
    print(f"{dimension} directions keep {sum(model.variance_shares):.4f} of the table")
    print(f"  flour with bake {words.similarity('flour', 'bake'):.4f}, sugar {words.similarity('flour', 'sugar'):.4f}, anchor {words.similarity('flour', 'anchor'):.4f}")
    print(f"  first document with the sixth {texts.similarity(0, 5):.4f}, with the thirteenth {texts.similarity(0, 12):.4f}")`,
              `2 directions keep 0.4799 of the table
  flour with bake 1.0000, sugar 1.0000, anchor -0.0028
  first document with the sixth 0.9998, with the thirteenth 0.0819
4 directions keep 0.6801 of the table
  flour with bake 1.0000, sugar 0.8830, anchor -0.0001
  first document with the sixth 0.1743, with the thirteenth 0.0554
6 directions keep 0.8416 of the table
  flour with bake 0.0727, sugar 0.8777, anchor 0.0030
  first document with the sixth 0.0859, with the thirteenth 0.0855`,
              { hints: [
  "Fit a fresh decomposition for each width.",
  "A narrow fit can make topic mates nearly identical; extra directions can restore distinctions while changing their similarities."
], check: numberCheck("What share of the table do four directions keep, to four places?", 0.6801, 5e-05, "Four directions retain share 0.6801 of squared matrix magnitude. The quantity refers to the uncentered decomposed table, not a centered variance percentage."), question: "How does representation width change which relationships remain visible?" },
            ),
            exercise(
              "Check the error against what was thrown away",
              [
  "At widths two and four, reconstruct the decomposed term-document table. Print summed squared reconstruction error beside the sum of discarded squared singular values.",
  "Also report original zero-cell count, mean reconstructed value at those positions and negative reconstructed-cell count. Low-rank approximation is not constrained to nonnegative counts."
],
              `import numpy as np
from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
)

cooking = [
    "flour sugar and butter eggs oven",
    "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir",
    "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough",
    "we bake stir whisk dough pan",
    "stir whisk and dough pan flour",
    "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter",
    "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven",
    "we sugar butter eggs oven bake",
]
sailing = [
    "sail wind and boat harbour anchor",
    "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast",
    "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck",
    "we tide mast rope deck crew",
    "mast rope and deck crew sail",
    "rope deck crew the sail wind",
    "we deck crew sail wind boat",
    "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor",
    "we wind boat harbour anchor tide",
]
documents = cooking + sailing

for dimension in (2, 4):
    model = LatentSemanticAnalysis(dimension=dimension).fit(documents)
    original = np.asarray(model.term_document_matrix.values)
    # The rebuild is model.decomposition.reconstruction(). The discarded
    # weight is the decomposition's total_squared_singular_values less the
    # sum of the kept singular_values squared. Print the squared error,
    # the discarded weight, the count of cells where original is 0, the
    # mean of the rebuild over those cells, and the count of rebuilt cells
    # below zero.
    ...`,
              `import numpy as np
from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
)

cooking = [
    "flour sugar and butter eggs oven",
    "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir",
    "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough",
    "we bake stir whisk dough pan",
    "stir whisk and dough pan flour",
    "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter",
    "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven",
    "we sugar butter eggs oven bake",
]
sailing = [
    "sail wind and boat harbour anchor",
    "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast",
    "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck",
    "we tide mast rope deck crew",
    "mast rope and deck crew sail",
    "rope deck crew the sail wind",
    "we deck crew sail wind boat",
    "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor",
    "we wind boat harbour anchor tide",
]
documents = cooking + sailing

for dimension in (2, 4):
    model = LatentSemanticAnalysis(dimension=dimension).fit(documents)
    original = np.asarray(model.term_document_matrix.values)
    rebuilt = model.decomposition.reconstruction()
    error = np.sum((original - rebuilt) ** 2)
    kept = np.sum(np.asarray(model.singular_values) ** 2)
    discarded = model.decomposition.total_squared_singular_values - kept
    empty = original == 0
    print(f"{dimension} directions: error {error:.4f}, discarded {discarded:.4f}")
    print(f"  {empty.sum()} empty cells filled to {rebuilt[empty].mean():.4f} on average, {(rebuilt < 0).sum()} cells below zero")`,
              `2 directions: error 371.3389, discarded 371.3389
  408 empty cells filled to 0.4043 on average, 104 cells below zero
4 directions: error 228.3946, discarded 228.3946
  408 empty cells filled to 0.2541 on average, 136 cells below zero`,
              { hints: [
  "Use exactly the weighted matrix the fitted model decomposed.",
  "Mask original zero cells before taking their reconstructed mean; count negative values over the complete reconstruction."
], check: numberCheck("What is the squared error of the rebuild from four directions, to four places?", 228.3946, 5e-05, "The four-direction summed squared error is 228.3946. It matches the discarded squared singular contributions for this truncated decomposition."), question: "Does reconstruction error account for the directions that were discarded?" },
            ),
            exercise(
              "Fold new texts into a fitted collection",
              [
  "Fit the supplied twenty-four documents at width two, then transform the four probe texts without refitting. Print each coordinate pair beside its text.",
  "Transform the training documents as a consistency check and print their maximum coordinate difference. Then print the second word-coordinate values for whisk, eggs, deck and boat to interpret the mixed probe."
],
              `import numpy as np
from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
)

cooking = [
    "flour sugar and butter eggs oven",
    "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir",
    "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough",
    "we bake stir whisk dough pan",
    "stir whisk and dough pan flour",
    "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter",
    "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven",
    "we sugar butter eggs oven bake",
]
sailing = [
    "sail wind and boat harbour anchor",
    "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast",
    "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck",
    "we tide mast rope deck crew",
    "mast rope and deck crew sail",
    "rope deck crew the sail wind",
    "we deck crew sail wind boat",
    "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor",
    "we wind boat harbour anchor tide",
]
documents = cooking + sailing

texts = [
    "we bake the dough and whisk the eggs",
    "the crew sail the boat past the harbour",
    "a quiet afternoon",
    "whisk the eggs on the deck of the boat",
]

model = LatentSemanticAnalysis(dimension=2).fit(documents)

# Fold the texts in with model.transform, and print each one's two
# coordinates, which vector_of gives by the text's place in the list.

# Fold the fitted documents in the same way and print the largest absolute
# difference between those vectors and model.document_vectors.vectors.

# Print the second coordinate of whisk, eggs, deck and boat.`,
              `import numpy as np
from oop_ml.core.natural_language_processing.embeddings.counts.latent_semantic_analysis import (
    LatentSemanticAnalysis,
)

cooking = [
    "flour sugar and butter eggs oven",
    "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir",
    "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough",
    "we bake stir whisk dough pan",
    "stir whisk and dough pan flour",
    "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter",
    "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven",
    "we sugar butter eggs oven bake",
]
sailing = [
    "sail wind and boat harbour anchor",
    "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast",
    "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck",
    "we tide mast rope deck crew",
    "mast rope and deck crew sail",
    "rope deck crew the sail wind",
    "we deck crew sail wind boat",
    "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor",
    "we wind boat harbour anchor tide",
]
documents = cooking + sailing

texts = [
    "we bake the dough and whisk the eggs",
    "the crew sail the boat past the harbour",
    "a quiet afternoon",
    "whisk the eggs on the deck of the boat",
]

model = LatentSemanticAnalysis(dimension=2).fit(documents)

folded = model.transform(texts)
for place, text in enumerate(texts):
    first, second = folded.vector_of(place)
    print(f"{first:.4f} {second:7.4f}  {text}")

again = np.asarray(model.transform(documents).vectors)
fitted = np.asarray(model.document_vectors.vectors)
print(f"fitted documents folded back in move by at most {np.abs(again - fitted).max():.1e}")

for word in ("whisk", "eggs", "deck", "boat"):
    print(f"{word:5s} {model.embeddings.vector_of(word).values[1]:7.4f}")`,
              `3.7471 -1.9689  we bake the dough and whisk the eggs
3.3330  2.0586  the crew sail the boat past the harbour
0.0000  0.0000  a quiet afternoon
3.2910  0.0000  whisk the eggs on the deck of the boat
fitted documents folded back in move by at most 3.1e-14
whisk -2.3562
eggs  -3.1580
deck   2.3562
boat   3.1580`,
              { hints: [
  "Unknown words are outside the fitted vocabulary and do not create new directions during transform.",
  "Inspect which known words contribute in opposite directions before interpreting a mixed text near the separating-axis origin."
], check: numberCheck("Where on the first direction does the text with two words of each half land, to four places?", 3.291, 5e-05, "The mixed text’s first coordinate is 3.2910. Its cooking and sailing contributions cancel along the second direction, while a shared first-direction contribution remains."), question: "Where does a fitted document space put unfamiliar text?" },
            ),
          ],
        },
      ]}
    />
  );
}
