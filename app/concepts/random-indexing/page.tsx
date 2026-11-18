import { pageMetadata } from "@/lib/seo";
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
import { DrawToDrawSpread } from "@/components/widgets/DrawToDrawSpread";
import { DrawnDirections } from "@/components/widgets/DrawnDirections";
import { OnePassOrOneProduct } from "@/components/widgets/OnePassOrOneProduct";
import { PerpendicularityCurve } from "@/components/widgets/PerpendicularityCurve";
import { PositionBuildUp } from "@/components/widgets/PositionBuildUp";
import { RandomIndexingPlayground } from "@/components/widgets/RandomIndexingPlayground";
import { ThreeReadingsOfOneCount } from "@/components/widgets/ThreeReadingsOfOneCount";
import { WidthAgainstTheTable } from "@/components/widgets/WidthAgainstTheTable";

export const metadata: Metadata = pageMetadata("/concepts/random-indexing", {
  title: "Random Indexing · Perceptron Lab",
  description:
    "Random indexing accumulates fixed-size context vectors as word occurrences arrive. It summarizes relationships without storing every word-context count, with random projection affecting how precisely those relationships are preserved.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function RandomIndexingPage() {
  return (
    <ConceptPage
      lessonId="random-indexing"
      intuition={lessonIntuitions["random-indexing"]}
      technicalStart="Part 2. A Direction For Every Word"
      openingTitle="Keep a Sketch Instead of the Whole Count Table"
      playgroundTitle="Build context vectors by adding sparse directions"
      playgroundIntro="Follow which context vectors are added for one word. Compare the resulting neighbors at different widths and random seeds."
      title="Random Indexing"
      tagline={"Random indexing accumulates fixed-size context vectors as word occurrences arrive. It summarizes relationships without storing every word-context count, with random projection affecting how precisely those relationships are preserved."}
      prerequisites={
        <>
          {"We compare the resulting vectors using "}{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            cosine
          </Link>{" "}
          {" similarity, which measures directional alignment while ignoring magnitude. Random indexing provides an alternative to building a wide count table and then reducing its dimensions, as in "}{" "}
          <Link href="/concepts/latent-semantic-analysis" className={link}>
            latent semantic analysis
          </Link>{" "}

          uses, so a reader who has met that will recognize the problem in Part
          1 immediately, though nothing later depends on having read it.
        </>
      }

      playground={<RandomIndexingPlayground />}
      sections={[
        {
          title: "Part 1. The Table That Only Exists To Be Thrown Away",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Twenty-four documents, and three sentences small enough to check">
                <>
<p>
                  We will reuse twenty-four documents with two controlled topics. The cooking half uses flour, sugar, butter, eggs, oven, bake, stir, whisk, dough and pan. The sailing half uses sail, wind, boat, harbour, anchor, tide, mast, rope, deck and crew. A smaller collection later lets us calculate individual updates by hand.
                </p>
                <p>The content-word lists are separate. Both use and, the and we, with one such word in each document. Their shared presence does not identify the subject in this constructed collection.</p>
</>
                <p>Each document contains five successive topic words and one shared word, giving 144 occurrences over 23 vocabulary entries. Rotating the topic words creates a controlled pattern of shared contexts. The later similarity measurements test how well the shorter representations preserve that pattern.</p>
                <p>
                  The smaller collection is three sentences of three words each,
                  the cat sat, the dog sat and the cat ran. Five distinct words,
                  and every number it produces can be checked by hand, which is
                  what Part 2 uses it for.
                </p>
                <KeepInMind>
                  {"The fit receives the documents without topic labels. We use the known groups to measure within-topic and cross-topic similarities. These are useful checks on this example, rather than a complete evaluation of the representation."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Counting which word turned up beside which">
                <p>A full co-occurrence table records how often each word appears near each context word. The window size and document-boundary rule define what near means. This experiment uses the stated window within each document; a different choice would change the evidence being summarized.</p>
                <p>
                  Every pair is counted from both ends, so the table is the same
                  read either way round, and a word&rsquo;s row and its column
                  hold the same numbers. On the twenty-four documents the row of
                  flour totals 30 and the rows of and, the and we total 40 each,
                  which is a fact Part 4 comes back to.
                </p>
                <WorkedExample title="Three sentences, two positions each side">
                  <>
<p>
                    Take the cat sat, the dog sat and the cat ran, and count everything within two positions. In the first sentence the is beside cat and two from sat, cat is beside both, and sat is beside cat and two from the. Do that for all three and the row of the reads 0, 2, 2, 1, 1 against the vocabulary in the order the, cat, sat, dog, ran.
                  </p>
                  <p>
                    The row of cat reads 2, 0, 1, 0, 1, and the row of ran reads 1, 1, 0, 0, 0. Twenty five cells for five words, and the whole thing fits on a line.
                  </p>
</>
                </WorkedExample>
                <KeepInMind>
                  A count says how often two words were seen together and
                  nothing else. Order is gone, since a pair is counted from both
                  ends, and so is which document the pair was in, since every
                  document adds into the same cell.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. Most pairs of words never once met">
                <p>
                  What about two words that never occur beside one another? Their rows can still look similar if they occur beside the same other words. We compare the whole context profiles, not only the cell for the pair itself. That lets the representation express a relationship supported by shared contexts even when the words never meet.
                </p>
                <p>
                  On the twenty-four documents, 110 of the 190 pairs made of two
                  subject words never once appeared in the same document. Flour
                  and bake are one such pair, and their cell in the table holds
                  exactly 0. Compare their rows and the answer is 0.7551, which
                  is higher than any pair flour actually did meet. The nearest
                  word to flour, by the table, is a word it was never once seen
                  beside.
                </p>
                <KeepInMind>
                  {"A context profile can be useful even when a particular pair never co-occurs. Computing that profile does not require the entire matrix to exist first: rows can be stored sparsely, accumulated selectively, or projected as events arrive. Random indexing uses the last option."}
                </KeepInMind>
              </SubSection>

              <SubSection title="4. The widest thing in the calculation is the thing nobody wants">
                <p>
                  {"A dense vocabulary-by-vocabulary table has 529 cells here. A 16-coordinate vector for each of 23 words has 368 values. Count-based methods need not always reduce their rows, and sparse storage can avoid allocating every possible cell. Random indexing lets us accumulate the smaller projected rows directly."}
                </p>
                <Equation>{"numbers in the table = V × V"}</Equation>
                <Equation>{"numbers in the answer = V × d"}</Equation>
                <>
                  <p>
                    Constructing the full co-occurrence representation before reducing
                    it allocates more coordinates than the final vectors retain.
                  </p>
                  <Equation>{"temporary-to-final width ratio = vocabulary size / embedding width\nexample ratio = 23 / 16 ≈ 1.44"}</Equation>
                  <p>
                    The ratio is small on this toy corpus. It grows when the vocabulary
                    grows while the requested embedding width stays fixed.
                  </p>
                </>
                <InAModel>
                  At this scale, forming 529 entries to retain 368 is inexpensive. The concern becomes practical with larger vocabularies: building the full co-occurrence table can require much more storage than the representation we keep. Random indexing lets us investigate a way to accumulate a smaller representation directly.
                </InAModel>
                <KeepInMind>
                  {"A full batch decomposition may need substantial work when the table changes. Incremental decompositions also exist. Random indexing takes another approach: keep a fixed random map and update the accumulated vectors as new context events arrive. Sahlgren’s 2005 introduction presents it as an incremental way to build context representations without first retaining the full wide matrix."}
                </KeepInMind>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://www.diva-portal.org/smash/get/diva2%3A1041127/FULLTEXT01.pdf">{"Sahlgren: An Introduction to Random Indexing (2005)"}</Link></p>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. A Direction For Every Word",
          content: (
            <>
              <SubSection title="5. Give every word a direction, drawn before a word is read">
                <p>
                  The trick starts somewhere that looks unpromising. Give every
                  word in the vocabulary a fixed list of numbers of exactly the
                  width the answer is wanted at, drawn at random, and having
                  nothing whatever to do with what that word means or where it
                  appeared. Almost all of the entries are zero. A few positions
                  are picked at random without repeating, half of them are set
                  to +1 and the other half to −1.
                </p>
                <p>
                  {"Here each index vector has 16 coordinates, with four nonzero entries. Flour’s occupied positions are 5,7,8 and 9. A different seed changes the draw, although individual coordinates or even complete index vectors can coincide."}
                </p>
                <DrawnDirections
                  words={["flour", "sugar", "bake", "anchor", "the"]}
                />
                <KeepInMind>
                  {"The random index vectors are assigned independently of the words’ contexts. They are identifiers used to construct the representation, not learned meanings. At limited width, some index vectors can overlap or even coincide, so their numerical comparisons need not all be equal."}
                </KeepInMind>
              </SubSection>

              <SubSection title="6. A word’s position is the sum of the directions it was seen beside">
                <p>
                  Now read the collection once, straight through. Every time a
                  word appears, look at the words within the window on either
                  side of it, and add each of their directions onto a running
                  total kept for the word in the middle. When the reading
                  finishes, the running total is that word&rsquo;s position, and
                  it is as wide as a direction was, which is the width that was
                  asked for.
                </p>
                <Equation>
                  {
                    "position(word) = Σ over every occurrence  Σ over every neighbour  weight(distance) × direction(neighbour)"
                  }
                </Equation>
                <p>
                  {"Words with identical weighted context profiles accumulate identical vectors. Similar profiles may produce similar directions, with distortion from the random map. Each word still needs a stored accumulated row; the storage saving comes from that row’s smaller width."}
                </p>
                <PositionBuildUp />
                <WorkedExample title="Cat, over three sentences">
                  <>
<p>

                    Cat appears twice, in the cat sat and in the cat ran, and with a window of two positions it has four neighbors in all. Adding the direction of the gives 0, 0, 1, −1, −1, 0, 1, 0. Adding sat next cancels the −1 in the fifth position and leaves 0, 0, 1, −1, 0, 1, 0, −1.
                  </p>
                  <p>
                  {"The second sentence contributes the again and then ran. The final vector is [0, 1, 2, −3, 0, 0, 1, −1], matching the fitted result. This hand calculation accumulates four context vectors directly. It does not need a full count matrix, although the SDK uses that matrix in its implementation."}
                </p>
</>
                </WorkedExample>
                <KeepInMind>
                  A word with no company at all keeps the total it started with,
                  which is a position of all zeros. That is not a small number,
                  it is the origin, and the origin has no direction, which is
                  the first entry in the table at the end of this page.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. Nothing is fitted and nothing is decomposed">
                <p>
                  {"Direct accumulation builds a word vector by adding its neighbors' fixed index vectors. It needs no gradient-descent learning rate or convergence loop and can be organized as a streaming pass. The SDK takes the equivalent matrix route below: it first builds and stores co-occurrence counts, then multiplies by the index-vector table. Neither route requires a singular-value decomposition."}
                </p>
                <p>
                  {"Once the vocabulary assignment, random map, event order and numeric implementation are fixed, the accumulation is reproducible. Changing floating-point summation order can change the last few bits, even with the same random seed."}
                </p>
                <p>
                  {"For a sparse accumulation implementation, the twenty-four documents contain 144 word occurrences and 720 selected word-context events. Each event contributes four nonzero entries, giving 2,880 coordinate additions. This count excludes vocabulary construction, vector allocation and later comparisons. It describes the direct-accumulation route, not the dense matrix multiplication used by this SDK."}
                </p>
                <InAModel>
                  {"With a fixed number of nonzero entries per index vector, each direct context update touches a fixed number of coordinates. The number of such updates grows with the text and window size. Storing one learned vector per word still costs vocabulary size times output width, and allocating a dense co-occurrence table costs the square of the vocabulary size. These are separate update and storage costs."}
                </InAModel>
              </SubSection>

              <SubSection title="8. One pass, or one multiplication">
                <p>
                  There is a second route to the same positions, and it is the
                  route that says what the method actually is. Instead of
                  walking the collection, build the table of counts from Part 1,
                  stack the drawn directions into a block with a row per word,
                  and multiply the two together. A word&rsquo;s row of counts
                  says how many of each other word&rsquo;s direction to add, so
                  the multiplication and the walk are the same additions in a
                  different order.
                </p>
                <Equation>{"positions = counts × directions"}</Equation>
                <p>
                  So a position is a word&rsquo;s row of the table, projected
                  from as many numbers as there are words down to as many
                  numbers as were asked for, by a random map. That is what makes
                  this a projection of the table rather than a rule of thumb
                  that happens to work, and it is why the geometry in Part 3
                  applies to it at all.
                </p>
                <OnePassOrOneProduct />
                <p>

                  Measured on the three sentences, and on the twenty-four
                  documents as well, the two routes agree exactly and the largest
                  disagreement anywhere in the answer is 0, since every weight
                  involved is a number binary holds exactly. Move to the
                  twenty-four documents and let a neighbor further away count
                  less, so that a weight of a third appears, and the largest
                  disagreement becomes 8.88 × 10⁻¹⁶ in a table whose largest
                  entry is 11.25, which is rounding and not a difference of
                  method.
                </p>
                <KeepInMind>
                  {"The SDK uses this count-matrix product, which exposes the relation between full context rows and their projected vectors. A streaming implementation can accumulate the same contributions without storing the dense table. In exact arithmetic they compute the same representation; their storage and computation costs differ."}
                </KeepInMind>
              </SubSection>

              <SubSection title="9. What the fit answers on the twenty-four documents">
                <p>
                  Sixteen numbers a word, four of them non-zero in each drawn
                  direction, one reading of the collection. Two words of one
                  subject come out at 0.6399 on average and a word of each
                  subject at 0.1247, and the two halves were never named to it.
                  The whole table of counts, read directly and never squeezed,
                  answers 0.6629 and 0.1192 to the same two questions.
                </p>
                <p>
                  Asked which words are nearest to flour, the fit answers eggs
                  at 0.7909, butter at 0.7285, bake at 0.7130, whisk at 0.7017,
                  pan at 0.7003 and sugar at 0.6270. All six are cooking words,
                  and the six words it puts furthest away, anchor, tide, wind,
                  boat, harbour and sail, are all sailing words. The playground
                  at the top of this page is that fit, with the width, the draw
                  and the counting rule left open.
                </p>
                <KeepInMind>
                  The reason to compare against the whole table rather than
                  against some notion of the right answer is that the table is
                  what this method approximates. It is not a better method; it
                  is the thing being projected, and Part 4 is about how far the
                  projection moves it.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "By the table of counts, the word nearest to flour is one it was never once seen beside.",
              true,
              "Flour and bake never appeared in the same document and their cell in the table holds exactly 0, yet comparing their two rows answers 0.7551, higher than any pair flour did meet. What a counting method reads is the angle between two whole rows, not the cell where the two words meet.",
            ),
            choice(
              "What does the direction drawn for a word carry?",
              [
                "A fixed random index code, assigned without learning semantic or context information",
                "A small version of the word’s final position, refined as the reading proceeds",
                "The word’s own row of the table of counts, already squeezed",
                "How often the word turned up in the collection",
              ],
              0,
              "The index vector is assigned independently of the word's meaning and observed contexts. It provides a fixed signed code whose contributions can be accumulated. Two drawn vectors may overlap by chance; they are not promised to be orthogonal. The fitted context vector becomes informative through the observations that are added to it.",
            ),
            trueFalse(
              "With the corpus and context settings fixed, fixing the random index draw makes repeated runs deterministic.",
              true,
              "With the corpus, tokenization, context rule and index draw fixed, the resulting representation is deterministic. There is no gradient-descent objective or convergence loop. This SDK constructs the context-count matrix and multiplies it by the index-vector matrix. A streaming implementation can accumulate the same contributions directly, but that is not a claim that this teaching implementation avoids the full table.",
            ),
            choice(
              "Why does the second route, multiplying the table of counts by the stacked directions, matter?",
              [
                "It states what the accumulating pass computes, which is what lets the geometry of random projections apply to it",
                "It is the cheaper of the two routes once the vocabulary is large",
                "It gives a more accurate answer than walking the collection does",
                "It is the route implementations actually take",
              ],
              0,
              "The matrix product makes the method's meaning explicit: each full context row is multiplied by the same random map. This is the route the SDK actually uses. Summing context contributions directly gives the same result in exact arithmetic. With fractional weights, a different addition order can produce rounding differences; the reported comparison differs by 8.88e−16 on entries whose largest value is 11.25.",
            ),
            choice(
              "In a sparse streaming implementation,720 context occurrences each update four nonzero index entries. What determines the number of accumulation updates?",
              [
                "How long the collection is and how many non-zero entries a direction carries, and not at all with the vocabulary or the width",
                "The square of the vocabulary, since every word has a direction and every direction is added to every other",
                "The width of the positions, since each addition touches every coordinate of the running total",
                "The number of distinct words, since a wider vocabulary means more directions to draw",
              ],
              0,
              "The count follows context occurrences and the number of nonzero entries added for each one.\n\n```math\nsparse accumulation updates = 720 × 4 = 2,880\n```\n\nIncreasing width alone does not increase that sparse addition count, but it can increase storage and comparison work. The SDK here instead builds a dense count matrix and multiplies it by the drawn vectors. A sparse count representation need not reserve every possible word-pair cell.",
            ),
        ],
        },
        {
          title: "Part 3. Why Adding Up Directions Does Not Turn To Mush",
          content: (
            <>
              <SubSection title="10. Two random directions in many dimensions barely overlap">
                <p>
                  The obvious objection to Part 2 is that the additions must
                  interfere. Twenty-three words are being added into positions
                  only sixteen numbers wide, so there is not enough room for
                  each word to have a place of its own, and every position ought
                  to end up as a smear of everything.
                </p>
                <p>
                  {"Sparse random index vectors often have disjoint occupied positions and therefore zero dot product. With sufficient width, overlaps are less common. This limits interference in the accumulated representation, but does not make every original context contribution uniquely recoverable from a lower-dimensional sum."}
                </p>
                <p>
                  Drawing two hundred directions at once and measuring all
                  19,900 pairs of them, at 50 numbers each the mean size of the
                  overlap is 0.0744 and 71.8% of the pairs are at exactly a
                  right angle. At 500 numbers it is 0.0077 and 96.9%. Neither is
                  a bound or an average over some assumption, it is what the
                  draw produced.
                </p>
                <KeepInMind>
                  Two nonzero signatures with no occupied position in common
                  have a dot product of zero, so they are perpendicular. Sparse
                  signatures often have this disjoint support. Sharing a position
                  can introduce interference, but it does not always make the dot
                  product nonzero: positive and negative contributions can cancel.
                  We need the signed products to decide, rather than the overlap
                  count alone.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The rule that predicts it, and where it stops predicting">
                <p>
                  {"If each index vector occupies n randomly selected positions out of d, two supports share n²/d positions on average. Ignoring sign cancellation and dividing by the common squared length gives n/d. Treat that as an overlap-based heuristic for absolute normalized interference when collisions are rare, not a general exact expectation."}
                </p>
                <Equation>{"expected overlap ≈ n / d"}</Equation>
                <p>
                  At four non-zero entries in fifty positions that says 0.0800
                  and the measurement is 0.0744; at five hundred positions it
                  says 0.0080 and the measurement is 0.0077. Those are close
                  enough that the rule is worth carrying around.
                </p>
                <p>
                  {"At narrow or dense settings, several shared positions can contribute opposite signs and cancel. The n/d heuristic then overestimates absolute interference. The measured examples below show that limit rather than a contradiction of the actual signed-dot-product calculation."}
                </p>
                <PerpendicularityCurve />
                <p>

                  The reason for both failures is the same. The rule counts the
                  shared positions and then treats each one as contributing its
                  full weight, when in fact the sign of a shared position is a
                  coin toss and the shared positions cancel each other. Once
                  there are many of them the canceling dominates, which is why
                  the measurement falls further and further below the prediction
                  as the directions fill.
                </p>
                <KeepInMind>
                  {"Use the heuristic only when shared positions are rare enough that cancellation is small. For other sparsities, measure signed inner products or use a result proved for the chosen random-map distribution."}
                </KeepInMind>
              </SubSection>

              <SubSection title="12. If they were exactly perpendicular, nothing would be lost">
                <>
<p>
                  Consider an ideal comparison first. If the context directions were mutually orthogonal and all had the same length, mapping count rows onto them would preserve angles, up to a common scale in lengths. That would preserve the comparisons exactly. Random indexing uses approximately orthogonal directions in a smaller space, so we need to measure the resulting distortion.
                </p>
                <p>
                  {"Under exact equal-length orthogonality, pairwise angles of count rows would be preserved. A smaller random map approximates those comparisons; it does not preserve every possible query or every original coordinate."}
                </p>
</>
                <WhyThisWorks title="What exact orthogonality would preserve, and why we approximate it">
                  <>
<p>
                    A d-dimensional space can contain at most d mutually orthogonal nonzero directions, fewer than the number of words in many vocabularies. The Johnson-Lindenstrauss result gives a related reason to consider random projections: for a fixed finite set of points, suitable random maps can preserve distances approximately with high probability using a dimension proportional to the logarithm of the point count divided by the squared error tolerance. That bound need not depend on the original dimension. It does not guarantee that every sparse projection or small draw used here preserves every comparison.
                  </p>
                  <p>
                  {"Achlioptas showed that particular binary and ternary random-map distributions can give Johnson–Lindenstrauss guarantees. The theorem’s distribution and scaling matter; it is not a guarantee for any sparse map with entries drawn from the same three values."}
                </p>
                <p className="text-sm"><Link className="underline underline-offset-4" href="https://doi.org/10.1145/375551.375608">{"Achlioptas: Database-friendly Random Projections (2001)"}</Link></p>
</>
                  <>
<p>
                  {"One 2048-coordinate draw gives all 23 index vectors disjoint occupied positions. In that case their equal-length orthogonality preserves the count-row cosines up to the measured rounding difference of 3.8×10⁻¹⁷. Another draw at the same width can have overlaps."}
                </p>
                  <p>
                    At the same width, another draw left two pairs sharing a position, and the angles moved by 0.0109. Exactness is a property of the draw rather than of the width.
                  </p>
</>
                </WhyThisWorks>
                <KeepInMind>
                  {"The Gram matrix of the drawn index vectors determines how the projection changes inner products. Shared positions can create nonzero cross terms, but signed contributions can cancel. The observed distortion also depends on the context rows being projected."}
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Sparse and ternary is a choice about cost, and it turns out to be free">
                <>
<p>
                  {"A sparse direct accumulator touches only the occupied positions in each index vector. Keeping that count fixed makes each context update independent of the output width. Wider output vectors still increase allocation, storage and the work of later comparisons."}
                </p>
                <p>
                  A dense direction touches every position, so the same reading at 2048 numbers a word would cost five hundred times what it costs at four.
                </p>
</>
                <p>
                  {"For unweighted context events, a direct sparse implementation can add or subtract values without multiplying by an arbitrary index entry. Distance-weighted contexts still require applying their weights. The SDK's dense matrix route does not obtain all the arithmetic savings of a specialized sparse accumulator."}
                </p>
                <p>
                  The question that decides whether this is a compromise is what
                  the sparsity costs in accuracy, and measured over twelve draws
                  at each setting, it costs almost nothing.
                </p>
                <NumberTable
                  headings={[
                    "width",
                    "2 non-zeros",
                    "4",
                    "8",
                    "16",
                    "32",
                  ]}
                  rows={[
                    ["16", "0.1770", "0.1714", "0.1729", "0.1732", "does not fit"],
                    ["64", "0.0811", "0.0670", "0.0752", "0.0832", "0.0834"],
                    ["256", "0.0364", "0.0393", "0.0378", "0.0338", "0.0357"],
                  ]}
                  caption="Mean absolute cosine changes over twelve draws. Sparsity has a smaller effect than width in these comparisons; the amount of improvement varies by row and column."
                />
                <p>In this experiment, changing the number of nonzero index entries has a small effect compared with the effect of increasing the vector width. The reported differences are 0.0056 at width 16 and 0.0055 at width 256, while the error for the compared setting falls from 0.1714 to 0.0393 as width grows. That supports the inexpensive two-entry choice here, without establishing it as best for every corpus or random draw.</p>
                <KeepInMind>
                  {"Single draws can reverse the ordering of two settings. The table therefore reports an average over twelve draws. When a particular word pair matters, inspect its variability as well as the aggregate error."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What The Shortcut Costs",
          content: (
            <>
              <SubSection title="14. The neighbors are reordered rather than replaced" id="14-the-neighbours-are-reordered-rather-than-replaced">
                <p>We can measure the approximation by comparing the random-indexing representation with the full context table it replaces. For flour, five of the six nearest words agree, but their order differs. Random indexing places eggs first while the full table ranks it third; the full table places bake first while random indexing ranks it third. The shortcut preserves much of this neighborhood without reproducing its ranking exactly.</p>
                <p>
                  {"Flour–anchor changes from positive 0.1208 in the count rows to negative 0.2437 after this projection. Negative cosine indicates opposing projected directions, not opposite meanings. This example shows how projection distortion can change even the sign of a low-similarity pair."}
                </p>
                <KeepInMind>
                  {"Low baseline similarity can be sensitive to projection error. Compare the observed changes for flour–sugar and flour–anchor, then inspect other pairs rather than treating these two as a universal worst-case rule."}
                </KeepInMind>
              </SubSection>

              <SubSection title="15. What each extra number a word buys">
                <p>
                  The measurement that prices the width is the same comparison
                  applied to every pair of two subject words at once. Take all
                  190 of them, read the angle from the whole table, read it from
                  the fit, and average how far apart the two answers are. At 8
                  numbers a word that gap is 0.3959, which is larger than most
                  of the angles being compared. At 16 it is 0.1441, at 64 it is
                  0.0542, and at 2048 it is 0.0109.
                </p>
                <WidthAgainstTheTable />
                <p>
                  Flour&rsquo;s whole list of six nearest words is recovered at
                  64 numbers and not before, which is a more demanding test than
                  the average gap and turns over at a definite place. Below
                  that, at 8 numbers, only two of the six survive.
                </p>
                <p>
                  The line running across that picture is the count of pairs of
                  drawn directions that still share a position, and the reason
                  it is drawn beside the gap is that they fall together. At 16
                  numbers, 155 of the 253 pairs share one; at 2048, two pairs
                  do, and the gap has fallen by a factor of thirteen.
                </p>
                <InAModel>
                  Look at 529 on that axis. The original count table has 23
                  rows and 23 columns, with 529 entries altogether. At this
                  setting, random indexing keeps 529 coordinates for every word,
                  so its output takes more space than the count table. The mean
                  cosine error is still 0.0181. Having enough coordinates does
                  not make this random map preserve every similarity exactly;
                  eight pairs of drawn directions still share a coordinate.
                </InAModel>
              </SubSection>

              <SubSection title="16. Where a method that builds the table wins">
                <p>

                  There is a place where the shortcut is plainly worse than the
                  alternative, and it is not about the projection at all. It is
                  about what gets projected. The sum in Part 2 adds a
                  neighbor&rsquo;s direction once per occurrence, so a word that
                  turns up beside everything contributes its direction to
                  everything, and the positions of two words that share nothing
                  but their function-word company are pulled together.
                </p>
                <p>
                  On the twenty-four documents the three words carrying no
                  subject have the largest rows in the collection, 40 each
                  against 35 for the largest subject word, and three rows out of
                  twenty-three account for 16.7% of the whole table. A word
                  carrying no subject comes out 0.5064 alike to a word that does,
                  under the fit, where the whole table of raw counts says 0.5173
                  and a reading that first divides out what frequency alone would
                  explain says 0.2207.
                </p>
                <ThreeReadingsOfOneCount />
                <p>
                  {"A direct sum of raw context directions inherits raw-frequency weighting. Fixed event weights can be applied during accumulation. If a later adjustment depends nonlinearly on individual pair counts, the projected sums alone may not retain enough information to apply it exactly. Keep counts, richer summaries or a way to reprocess the text when such changes are needed."}
                </p>
                <KeepInMind>
                  {"The 0.5064 versus 0.5173 comparison concerns approximation of raw counts. Changing which associations are emphasized is a separate representation decision, potentially requiring additional retained data."}
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Update work and storage" id="17-the-work-counted-honestly">
                <p>
                  {"Compare the direct sparse accumulator with the dense matrix route used by this SDK. Count update operations and storage separately; they grow with different aspects of the input."}
                </p>
                <NumberTable
                  headings={["what is done", "how much of it"]}
                  rows={[
                    ["word occurrences read", "144"],
                    ["occasions one word is in another’s window", "720"],
                    ["single numbers updated, one reading", "2,880"],
                    ["cells the table of counts would hold", "529"],
                    [
                      "multiplications to project that table at 16 numbers",
                      "8,464",
                    ],
                    ["numbers in the answer", "368"],
                  ]}
                  caption="The two routes to the same positions, on twenty-four documents of six words each with a window of five positions on either side."
                />
                <p>
                  {"The dense count table has 529 values and the final output has 368. A complete memory comparison also includes index vectors and any working arrays. Direct updates grow with the number of context events and occupied index entries; the dense projection’s product count grows with vocabulary size and width. Building the counts still requires reading the text."}
                </p>
                <InAModel>
                  {"Random indexing is useful when an incrementally accumulated narrow representation fits the application better than retaining full context profiles. Sparse count storage, batch factorization and indexed retrieval are other options. Choose from their actual storage, update and comparison costs."}
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Missing Context and Colliding Directions", id: "part-5-where-random-indexing-stops-being-defined",
          content: (
            <>
              <SubSection title="18. Nearly perpendicular is not perpendicular, and more text does not help">
                <p>
                  {"The random map is fixed before these context events are processed. That fixes the projection operator, but the distortion measured on a particular dataset also depends on the context profiles supplied to it."}
                </p>
                <>
<p>
                  {"The draw fixes which index vectors share coordinates. Repeating the same twenty-four documents doubles every count and every accumulated vector without supplying new context patterns. Cosine is unchanged by that common positive scale, so this repeat experiment cannot reduce the measured projection discrepancy. Different new observations need not preserve that discrepancy."}
                </p>
                <p>
                  Measured, the gap against the whole table is 0.14412102749793634 with the collection written once, and at 0.14412102749793634 with it written eight times, and one pair of words comes out at 0.6270095706410385 in both, identical to the last bit.
                </p>
</>
                <p>
                  {"A fixed random map still acts on whichever context counts are supplied. Repeating the identical corpus scales both the full and projected vectors, leaving their cosine comparisons unchanged. New and different text can change the count directions and therefore the observed projection distortion. More data may improve the count estimates without eliminating the approximation introduced by a limited-width random map."}
                </p>
                <KeepInMind>
                  {"In this repeated-corpus experiment, sixteen coordinates leave a reported cosine discrepancy of 0.1441. The tested width of 128 brings the chosen error measure below 0.05. That is evidence for these data and draws, not a universal width requirement. Increasing width or changing the random draw changes the approximation; repeating the same evidence does not remove it."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. The width is chosen before anything is read">
                <p>
                  A method that builds the table and squeezes it has a diagnostic
                  built into the squeeze. The directions come out ordered by how
                  much of the table each accounts for, so a reader can look at
                  where those figures fall away and cut there. The rule is a rough
                  one, and it is at least a quantity the fit itself produced.
                </p>
                <p>
                  Here there is nothing of the kind. The width is fixed before
                  the first word is read, every coordinate is as good as every
                  other by construction, and the reading produces no figure that
                  says whether the width was enough. Measured across the widths
                  on this collection the gap falls from 0.3959 to 0.0109 without
                  turning anywhere, so there is no elbow to find even if
                  somebody went looking.
                </p>
                <p>
                  What can be done instead is to fit twice at different widths
                  and see whether the answers agree, which is an external check
                  rather than a reading of the fit. That is worth saying plainly,
                  since it is the practical answer and it costs a second reading
                  of the collection.
                </p>
                <KeepInMind>
                  {"SVD directions have ordered singular values, but their signs can flip and tied subspaces can rotate across fits. Random-index coordinates instead depend on the assigned index vectors. In either case, align or retain the coordinate system before comparing raw coordinates from separate runs."}
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The answer depends on the draw">
                <p>
                  {"Changing the random map can change the projected comparisons. Measure the variation over draws when choosing a width, especially if the application depends on an individual neighbor rather than a broad average."}
                </p>
                <DrawToDrawSpread />
                <p>
                  Over twenty draws at 8 numbers a word, one pair of cooking
                  words comes back anywhere between 0.0189 and 0.9646, a spread
                  of 0.9457 on a scale that runs from −1 to 1. The same pair over
                  twenty draws at 16 numbers spreads by 0.4032, at 50 by 0.2853
                  and at 200 by 0.1182. Not one of those differences has anything
                  to do with the collection.
                </p>
                <p>
                  The separation between the two halves holds up much better than
                  any individual pair, which is worth knowing and is the reason
                  the method is usable at all. At 16 numbers the smallest
                  separation any of the twenty draws produced was 0.1735 and the
                  largest 0.8430, and every one of them had the two halves the
                  right way round.
                </p>
                <KeepInMind>
                  {"At the narrow widths tested, individual pair scores vary substantially across draws. Topic averages are steadier in this experiment. Report both when the application uses both, without treating one aggregate result as a guarantee for each query."}
                </KeepInMind>
              </SubSection>

              <SubSection title="21. Words without neighbors and vectors with no direction" id="21-the-cases-with-nothing-to-compute">
                <p>A word can receive a random index without ever receiving a useful accumulated context vector. Look for missing neighbors and a zero accumulated direction before asking for similarity.</p>
                <DerivationTable
                  expressionHeading="Context or index-vector condition"
                  reasonHeading="What the accumulated vector retains"
                  rows={[{"expression":"a word with no company at all","reason":"its position is a sum over nothing, which is the origin rather than a small number. The origin has no direction, so the angle between it and anything else is a zero divided by a zero and is undefined; a ranking of what such a word resembles does not exist rather than being empty."},{"expression":"two words whose company is identical","reason":"the same position exactly, whatever was drawn, since both sums are over the same collection of directions, and a sum is settled by what goes into it and by nothing else. That is correct rather than a failure, and it says the method can never tell such words apart, at any width and under any draw."},{"expression":"positions only two numbers wide","reason":"With balanced two-entry index vectors in two dimensions, all accumulated vectors lie on one line. Nonzero pair cosines are then+1 or−1; cancellations can also produce a zero vector needing separate handling."},{"expression":"an odd number of non-zero entries","reason":"This balanced construction requires equal counts of+1 and−1, so it rejects odd sparsity. Other random-map constructions can allow it with an appropriate distribution; imbalance does not automatically force a deterministic drift."},{"expression":"more non-zero entries than there are positions","reason":"undefined. The positions are drawn without repeating, so asking for eight distinct slots in a direction four numbers long names a set that is not there."},{"expression":"how many numbers to give a word","reason":"a real choice with nothing inside the reading to settle it. Measured here, the gap against the whole table falls from 0.3959 at eight numbers to 0.0109 at two thousand and forty-eight, monotonically and without an elbow, so no quantity the fit produces turns over as the width passes a good value."},{"expression":"which draw was used","reason":"part of the answer rather than a detail of it. Two fits differing in nothing else gave one pair of words 0.0189 and 0.9646 at eight numbers a word, and spreads of 0.4032, 0.2853 and 0.1182 at sixteen, fifty and two hundred over twenty draws."},{"expression":"the value of a single coordinate","reason":"Each coordinate is a signed sum specified by the retained random map. It is interpretable in that coordinate system but need not align with the same numbered coordinate after a redraw."},{"expression":"a pair of directions at exactly a right angle","reason":"Equal-length mutually orthogonal index vectors preserve inner products up to a common scale. One orthogonal pair alone does not guarantee preservation of every accumulated word comparison, since other context vectors also contribute."},{"expression":"more text","reason":"Repeating identical text scales the count and projected rows equally and preserves their cosine discrepancy. Different new contexts can change it even though the random map stays fixed."},{"expression":"a word too rare to be given a position","reason":"Filtering rare words before forming windows can close their gaps; preserving original token positions gives a different context rule. Record which rule is used rather than assuming every implementation does the same thing."},{"expression":"which of two words stood first","reason":"outside what is represented. A position is a sum, and addition does not remember an order, so a sentence and its reverse produce the same positions for every word in it."},{"expression":"which sense of a word is meant","reason":"One accumulated context vector combines all occurrences of the spelling. It does not select a sense per occurrence, and its position is not generally forced to a midpoint."}]}
                />
                <KeepInMind>
                  {"Choose the width and random-map construction with the intended queries in mind. Repeated identical evidence does not change cosine distortion, while new contexts can. Comparing draws and held-out task behavior helps assess whether the approximation is adequate."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 to 5",
          quiz: [
            choice(
              "At eight positions the rule n over d predicts an overlap of 0.5000 and the measurement is 0.2994. What is the rule missing?",
              [
                "The sign of a shared position is a coin toss, so shared positions cancel one another",
                "At eight positions no two directions share a position at all",
                "Too few pairs were measured for the figure to settle",
                "The rule was derived for dense directions and these are sparse",
              ],
              0,
              "The rule counts the shared positions and then treats each as contributing its full weight. Once there are many of them the canceling dominates, which is the same failure that makes it predict 1.0000 at fifty positions all filled where the measurement is 0.1162.",
            ),
            trueFalse(
              "Writing the same twenty-four documents out eight times lowers the gap between the fit’s angles and the table’s.",
              false,
              "Repeating the same collection eight times multiplies all its counts and accumulated vectors by eight while retaining the same random map. Cosine removes that common positive scale, so the comparison error remains 0.14412102749793634 and the displayed pair remains 0.6270095706410385. Repetition supplies no new independent context evidence. New, varied text can change the source count rows, which is a different experiment.",
            ),
            several(
              "Which statements agree with this random-indexing sweep?",
              [
                "At 16 numbers a word, 155 of the 253 pairs of drawn directions still share a position",
                "At width 529 the output is larger than the original 23 × 23 count matrix, and its mean cosine error is still 0.0181",
                "Flour’s whole list of six nearest words is recovered at 64 numbers and not before",
                "The gap against the table turns at a definite width, which says where to cut"
              ],
              [0, 1, 2],
              "Error decreases over the sampled widths, but those points do not identify a universally sufficient width. At width 529, this representation stores more values than the dense count table:\n\n```math\ncontext-vector values = 23 × 529 = 12,167\ndense count cells     = 23 × 23  = 529\n```\n\nRecovering one query's complete neighbor list at a tested width also does not guarantee another query or draw will behave identically.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Vocabulary: 23 words; count matrix: 23 × 23 = 529 numbers.\nRandom-indexed output stores 23 × width numbers.\n\nwidth  mean cosine error  pairs of sparse directions sharing a coordinate\n8      0.3959             not shown\n16     0.1441             155 of 253\n64     0.0542             not shown\n529    0.0181             8 of 253\n2048   0.0109             2 of 253\n\nFlour’s six exact-table nearest neighbours are all recovered first at width 64 in this sweep."
              },
            ),
            trueFalse(
              "A word carrying no subject coming out 0.5064 alike to a word that does is damage the projection did.",
              false,
              "The full count table gives 0.5173 for the same comparison, close to the projected 0.5064. The projection is therefore preserving a relationship already present in its input. The frequency-adjusted representation gives 0.2207 instead. A more accurate projection would not by itself remove the original frequency pattern; any change to the representation needs its own evaluation.",
            ),
            choice(
              "At a narrow width, which claim read off a single fit is the steadier one?",
              [
                "How far apart the two halves of the collection came",
                "The angle between one named pair of words",
                "What the fifth coordinate of a word means",
                "Which single word is nearest to flour",
              ],
              0,
              "Across the recorded width-eight draws, one pair's cosine ranges from 0.0189 to 0.9646. At width sixteen, all twenty draws separate the two group means in the intended order, with gaps from 0.1735 to 0.8430. These are reasons to inspect both individual comparisons and summaries across draws. A coordinate is an arbitrary signed context sum, not a fixed named topic axis; group summaries also need a stability check.",
            ),
        ],
        },
        {
          title: "Practice. Adding Up Directions With The Library",
          practice: [
            exercise(
              "Build the position of cat by hand and compare it with the fit",
              [
  "Fit the supplied three sentences at window two, width eight, four nonzero index entries and seed zero. Print the drawn index vectors for the, sat and ran.",
  "Independently visit cat’s context occurrences in source order and add their index vectors to an eight-zero accumulator, printing after every addition. Print the fitted cat vector and exact agreement check."
],
              `from oop_ml import RandomIndexing

sentences = ["the cat sat", "the dog sat", "the cat ran"]

model = RandomIndexing(dimension=8, n_nonzero=4, window=2, random_seed=0).fit(sentences)
for word in ("the", "sat", "ran"):
    direction = model.index_vectors.vector_of(word).values
    print(f"direction of {word}: {[int(entry) for entry in direction]}")
# Walk the three sentences. At every occurrence of cat, add the direction
# of each word within two positions onto a running total of eight zeros,
# printing the total after each addition. Then print the position the fit
# reports for cat and whether the two agree.`,
              `from oop_ml import RandomIndexing

sentences = ["the cat sat", "the dog sat", "the cat ran"]

model = RandomIndexing(dimension=8, n_nonzero=4, window=2, random_seed=0).fit(sentences)
for word in ("the", "sat", "ran"):
    direction = model.index_vectors.vector_of(word).values
    print(f"direction of {word}: {[int(entry) for entry in direction]}")

running = [0] * 8
for sentence in sentences:
    words = sentence.split()
    for position, word in enumerate(words):
        if word != "cat":
            continue
        for other, neighbour in enumerate(words):
            if other != position and abs(other - position) <= 2:
                direction = model.index_vectors.vector_of(neighbour).values
                running = [total + int(entry) for total, entry in zip(running, direction)]
                print(f"after adding {neighbour}: {running}")

reported = [int(entry) for entry in model.vector_of("cat").values]
print(f"the fit reports {reported}")
print(f"agree: {running == reported}")`,
              `direction of the: [0, 0, 1, -1, -1, 0, 1, 0]
direction of sat: [0, 0, 0, 0, 1, 1, -1, -1]
direction of ran: [0, 1, 0, -1, 1, -1, 0, 0]
after adding the: [0, 0, 1, -1, -1, 0, 1, 0]
after adding sat: [0, 0, 1, -1, 0, 1, 0, -1]
after adding the: [0, 0, 2, -2, -1, 1, 1, -1]
after adding ran: [0, 1, 2, -3, 0, 0, 1, -1]
the fit reports [0, 1, 2, -3, 0, 0, 1, -1]
agree: True`,
              { hints: [
  "A word’s random index vector differs from the context sum learned for that word.",
  "Count context occurrences, including repeated words; use the same window and sentence boundaries as the fit."
], check: numberCheck("What value is in cat's fourth accumulated coordinate?", -3, 0.5, "The fourth accumulated coordinate is -3. Index-vector contributions can cancel as well as reinforce because their nonzero entries have both signs."), question: "Can summing context index vectors reproduce cat’s learned representation?" },
            ),
            exercise(
              "Reproduce the sixteen-number fit",
              [
  "Fit the supplied twenty-four documents at width sixteen with four nonzero index entries and seed zero.",
  "Print flour’s nonzero index positions, six neighbors, same-topic/cross-topic mean cosines, flour/sugar and flour/anchor cosines, then anchor’s six neighbors."
],
              `from statistics import mean

from oop_ml import RandomIndexing

notes = [
    "flour sugar and butter eggs oven", "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir", "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough", "we bake stir whisk dough pan",
    "stir whisk and dough pan flour", "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter", "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven", "we sugar butter eggs oven bake",
    "sail wind and boat harbour anchor", "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast", "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck", "we tide mast rope deck crew",
    "mast rope and deck crew sail", "rope deck crew the sail wind",
    "we deck crew sail wind boat", "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor", "we wind boat harbour anchor tide",
]
cooking = ["flour", "sugar", "butter", "eggs", "oven", "bake", "stir", "whisk", "dough", "pan"]
sailing = ["sail", "wind", "boat", "harbour", "anchor", "tide", "mast", "rope", "deck", "crew"]

model = RandomIndexing(dimension=16, n_nonzero=4, window=5, random_seed=0).fit(notes)
# Print the positions where flour's drawn direction is non-zero, the six
# nearest words to flour with their cosines, the mean cosine between two
# words of one subject and between a word of each, flour against sugar,
# flour against anchor, and the six nearest words to anchor.`,
              `from statistics import mean

from oop_ml import RandomIndexing

notes = [
    "flour sugar and butter eggs oven", "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir", "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough", "we bake stir whisk dough pan",
    "stir whisk and dough pan flour", "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter", "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven", "we sugar butter eggs oven bake",
    "sail wind and boat harbour anchor", "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast", "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck", "we tide mast rope deck crew",
    "mast rope and deck crew sail", "rope deck crew the sail wind",
    "we deck crew sail wind boat", "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor", "we wind boat harbour anchor tide",
]
cooking = ["flour", "sugar", "butter", "eggs", "oven", "bake", "stir", "whisk", "dough", "pan"]
sailing = ["sail", "wind", "boat", "harbour", "anchor", "tide", "mast", "rope", "deck", "crew"]

model = RandomIndexing(dimension=16, n_nonzero=4, window=5, random_seed=0).fit(notes)
direction = model.index_vectors.vector_of("flour").values
print(f"flour's direction is non-zero at {[position for position, entry in enumerate(direction) if entry != 0]}")
for near in model.most_similar("flour", 6):
    print(f"  {near.word} {near.similarity:.4f}")
within = mean(
    model.similarity(first, second)
    for group in (cooking, sailing)
    for position, first in enumerate(group)
    for second in group[position + 1 :]
)
across = mean(model.similarity(first, second) for first in cooking for second in sailing)
print(f"two words of one subject {within:.4f}, a word of each {across:.4f}")
print(f"flour and sugar {model.similarity('flour', 'sugar'):.4f}")
print(f"flour and anchor {model.similarity('flour', 'anchor'):.4f}")
print(f"nearest to anchor {' '.join(model.most_similar('anchor', 6).words)}")`,
              `flour's direction is non-zero at [5, 7, 8, 9]
  eggs 0.7909
  butter 0.7285
  bake 0.7130
  whisk 0.7017
  pan 0.7003
  sugar 0.6270
two words of one subject 0.6399, a word of each 0.1247
flour and sugar 0.6270
flour and anchor -0.2437
nearest to anchor boat tide wind crew harbour we`,
              { hints: [
  "Distinguish sparse assigned index vectors from the accumulated embedding vectors used for similarity.",
  "Keep the supplied topic-word groups unchanged when averaging pairs."
], check: numberCheck("What cosine similarity does this draw give flour and anchor?", -0.2437, 0.0001, "Flour/anchor cosine is -0.2437 for this draw. A finite random projection can distort the original context-table geometry in either direction."), question: "Can a short random representation preserve useful topic neighbors?" },
            ),
            exercise(
              "Price the width against the table it avoids",
              [
  "Wrap the supplied full context-count rows as word embeddings and print the specified flour comparisons as the reference.",
  "For widths eight, sixteen, sixty-four and two thousand forty-eight at seed zero, average absolute cosine error across all 190 supplied subject-word pairs. Also evaluate width sixteen at seed one."
],
              `from statistics import mean

from oop_ml import RandomIndexing, WordEmbeddings

notes = [
    "flour sugar and butter eggs oven", "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir", "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough", "we bake stir whisk dough pan",
    "stir whisk and dough pan flour", "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter", "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven", "we sugar butter eggs oven bake",
    "sail wind and boat harbour anchor", "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast", "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck", "we tide mast rope deck crew",
    "mast rope and deck crew sail", "rope deck crew the sail wind",
    "we deck crew sail wind boat", "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor", "we wind boat harbour anchor tide",
]
subject = ["flour", "sugar", "butter", "eggs", "oven", "bake", "stir", "whisk", "dough", "pan",
           "sail", "wind", "boat", "harbour", "anchor", "tide", "mast", "rope", "deck", "crew"]
pairs = [(first, second) for position, first in enumerate(subject) for second in subject[position + 1 :]]

fit = RandomIndexing(dimension=16, n_nonzero=4, window=5, random_seed=0).fit(notes)
# Wrap the fit's table of counts in WordEmbeddings and print the table's
# cosine for flour and bake, with how often they met, and for flour and
# anchor. Then for widths 8, 16, 64 and 2048 at seed 0, and width 16 at
# seed 1, fit and print the mean gap between fit and table over the pairs.`,
              `from statistics import mean

from oop_ml import RandomIndexing, WordEmbeddings

notes = [
    "flour sugar and butter eggs oven", "sugar butter eggs the oven bake",
    "we butter eggs oven bake stir", "eggs oven and bake stir whisk",
    "oven bake stir the whisk dough", "we bake stir whisk dough pan",
    "stir whisk and dough pan flour", "whisk dough pan the flour sugar",
    "we dough pan flour sugar butter", "pan flour and sugar butter eggs",
    "flour sugar butter the eggs oven", "we sugar butter eggs oven bake",
    "sail wind and boat harbour anchor", "wind boat harbour the anchor tide",
    "we boat harbour anchor tide mast", "harbour anchor and tide mast rope",
    "anchor tide mast the rope deck", "we tide mast rope deck crew",
    "mast rope and deck crew sail", "rope deck crew the sail wind",
    "we deck crew sail wind boat", "crew sail and wind boat harbour",
    "sail wind boat the harbour anchor", "we wind boat harbour anchor tide",
]
subject = ["flour", "sugar", "butter", "eggs", "oven", "bake", "stir", "whisk", "dough", "pan",
           "sail", "wind", "boat", "harbour", "anchor", "tide", "mast", "rope", "deck", "crew"]
pairs = [(first, second) for position, first in enumerate(subject) for second in subject[position + 1 :]]

fit = RandomIndexing(dimension=16, n_nonzero=4, window=5, random_seed=0).fit(notes)
table = WordEmbeddings(fit.cooccurrence.vocabulary, fit.cooccurrence.counts)
met = fit.cooccurrence.count_between("flour", "bake")
print(f"table: flour and bake {table.similarity('flour', 'bake'):.4f}, met {met:.0f} times")
print(f"table: flour and anchor {table.similarity('flour', 'anchor'):.4f}")

for width, seed in ((8, 0), (16, 0), (64, 0), (2048, 0), (16, 1)):
    fit = RandomIndexing(dimension=width, n_nonzero=4, window=5, random_seed=seed).fit(notes)
    gap = mean(abs(fit.similarity(first, second) - table.similarity(first, second)) for first, second in pairs)
    print(f"width {width}, draw {seed}: gap {gap:.4f} over {len(pairs)} pairs")`,
              `table: flour and bake 0.7551, met 0 times
table: flour and anchor 0.1208
width 8, draw 0: gap 0.3959 over 190 pairs
width 16, draw 0: gap 0.1441 over 190 pairs
width 64, draw 0: gap 0.0542 over 190 pairs
width 2048, draw 0: gap 0.0109 over 190 pairs
width 16, draw 1: gap 0.1087 over 190 pairs`,
              { hints: [
  "Fit each width independently with the specified draw.",
  "Compare the same pair list with the full count-row reference; a wider projected vector can reduce approximation error without changing the source counts."
], check: numberCheck("What is the mean absolute cosine error at width sixteen and seed one?", 0.1087, 0.0001, "The width-sixteen second-draw mean absolute cosine error is 0.1087. Width and random draw both influence approximation error against the full context-count reference."), question: "How much similarity information does random projection lose at each width?" },
            ),
            exercise(
              "Ask about a word that kept no company",
              [
  "Append the supplied one-word sentence and fit the stated random-indexing model. Print lantern’s accumulated vector and its separately assigned random index vector.",
  "Ask for its cosine with cat and for its nearest words. Catch and print each library error’s class and message."
],
              `from oop_ml import MLLibError, RandomIndexing

sentences = ["the cat sat", "the dog sat", "the cat ran", "lantern"]

model = RandomIndexing(dimension=8, n_nonzero=4, window=2, random_seed=0).fit(sentences)
# Print the position of lantern and the direction drawn for it. Then ask
# for its similarity to cat and for its nearest word, catching the
# library's refusal each time and printing the class name and the message.`,
              `from oop_ml import MLLibError, RandomIndexing

sentences = ["the cat sat", "the dog sat", "the cat ran", "lantern"]

model = RandomIndexing(dimension=8, n_nonzero=4, window=2, random_seed=0).fit(sentences)
position = model.vector_of("lantern").values
direction = model.index_vectors.vector_of("lantern").values
print(f"position of lantern {[int(entry) for entry in position]}")
print(f"direction drawn for lantern {[int(entry) for entry in direction]}")

try:
    model.similarity("lantern", "cat")
except MLLibError as refusal:
    print(f"{type(refusal).__name__} {refusal}")

try:
    model.most_similar("lantern", 1)
except MLLibError as refusal:
    print(f"{type(refusal).__name__} {refusal}")`,
              `position of lantern [0, 0, 0, 0, 0, 0, 0, 0]
direction drawn for lantern [0, 1, 0, -1, 1, -1, 0, 0]
UndefinedMetricError cosine similarity is undefined for a zero vector, which has no direction
UndefinedMetricError the zero vector has no direction, so nothing is similar to it`,
              { hints: [
  "The isolated word receives an index vector, but no surrounding words contribute to its context sum.",
  "A stored zero context vector is valid data even though a direction-based metric cannot use it."
], question: "What can be stored for an isolated word even when cosine cannot compare it?" },
            ),
          ],
        },
      ]}
    />
  );
}
