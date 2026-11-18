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
import { ConcentrationChart } from "@/components/widgets/ConcentrationChart";
import { HyperplaneCodes } from "@/components/widgets/HyperplaneCodes";
import { PictureDistanceLedger } from "@/components/widgets/PictureDistanceLedger";
import { PictureSearchPlayground } from "@/components/widgets/PictureSearchPlayground";
import { RecallTradeOffChart } from "@/components/widgets/RecallTradeOffChart";
import { SearchSeedTable } from "@/components/widgets/SearchSeedTable";

export const metadata: Metadata = pageMetadata("/concepts/searching-a-collection-of-pictures", {
  title: "Searching a Collection of Pictures · Perceptron Lab",
  description:
    "Image vectors allow pictures to be searched by similarity. Comparing every vector provides a reference result, while approximate indexes reduce search work by accepting some missed neighbors.",
});

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function SearchingACollectionOfPicturesPage() {
  return (
    <ConceptPage
      lessonId="searching-a-collection-of-pictures"
      intuition={lessonIntuitions["searching-a-collection-of-pictures"]}
      technicalStart="Part 2. What the Exact Answer Costs"
      openingTitle="A Useful Similarity Measure Still Has to Search the Collection"
      playgroundTitle="Which pictures does this query retrieve?"
      playgroundIntro="Compare each indexed result with the exact neighbors. Read the number of comparisons together with recall, the share of exact neighbors recovered."
      title="Searching a Collection of Pictures"
      tagline={"Image vectors allow pictures to be searched by similarity. Comparing every vector provides a reference result, while approximate indexes reduce search work by accepting some missed neighbors."}
      prerequisites={
        <>
          The sixteen numbers every picture is searched by are the hidden layer
          of the network on{" "}
          <Link href="/concepts/a-vector-for-a-picture" className={link}>
            a vector for a picture
          </Link>
          , which the{" "}
          <Link href="/concepts/convolutional-networks" className={link}>
            convolutional networks
          </Link>{" "}
          page assembles. Nearness is straight-line distance as{" "}
          <Link href="/concepts/distance-and-similarity" className={link}>
            distance and similarity
          </Link>{" "}
          treats it, the search is the one{" "}
          <Link href="/concepts/k-nearest-neighbours" className={link}>

            k-nearest neighbors
          </Link>{" "}
          votes with, and the cells of Part 3 are cut by{" "}
          <Link href="/concepts/k-means" className={link}>
            k-means
          </Link>
          . The page beside this one,{" "}
          <Link href="/concepts/learning-the-metric-itself" className={link}>
            learning the metric itself
          </Link>
          , trains the positions for nearness directly.
        </>
      }

      playground={<PictureSearchPlayground />}
      sections={[
        {
          title: "Part 1. A Picture as a Question",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Four thousand pictures, each sixteen numbers">
                <>
<p>We will search sixteen-by-sixteen images of crosses, square outlines, filled discs and diagonal bars. As before, their positions, sizes and brightness vary. The trained classifier supplies a vector of sixteen values from its layer before the final shape prediction. We store that vector as the image’s search representation.</p>
                <p>To retrieve similar images, we compare the query vector with the stored vectors and rank them by distance. The search no longer compares every pixel directly. Its usefulness now depends on whether the learned vectors place the kinds of images we want together.</p>
</>
                <Equation>{"picture  →  network  →  v  =  (v₁, v₂, …, v₁₆),     each vᵢ between −1 and 1"}</Equation>
                <>
<p>
                  We will search a collection of 4000 generated pictures, 1000 of each shape, using seed 11. The trained network can encode each new picture with a forward pass. Our queries are its 240 held-out pictures, sixty of each kind. Those queries were excluded from training and are separate from the search collection, so the task is to find similar pictures rather than retrieve an identical entry.
                </p>
                <p>
                  {"Each feature comes from a hyperbolic tangent, whose mathematical output lies between −1 and 1. The collection vectors have mean length 3.03; the maximum possible length in that sixteen-coordinate range is 4. Many coordinates therefore have substantial magnitudes. The length alone does not tell us which coordinates carry useful distinctions."}
                </p>
</>
                <KeepInMind>
                  {"The search compares learned vectors rather than pixels directly. Training asked the network to distinguish four kinds of shape. Whether its distances also reflect size, position or another property needs a separate test."}
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What a search returns">
                <p>

                  Ask for the pictures nearest held-out picture 0, a cross, and
                  the answer is a list, the k pictures of the collection whose
                  positions are closest to its position, nearest first. The
                  playground shows that list for any question, each picture
                  framed in the color of its kind, and for picture 0 all ten of
                  the nearest are crosses. The nearest is 0.5278 away and the
                  tenth 0.7691 away, while the farthest picture in the
                  collection is 5.3240 away.
                </p>
                <Equation>{"d(q, x)  =  √( Σᵢ (qᵢ − xᵢ)² )\n\nanswer(q, k)  =  the k pictures x of the collection with the smallest d(q, x), nearest first"}</Equation>
                <p>This retrieves the neighbors that k-nearest neighbors would ordinarily use for a vote; here the returned pictures are the answer. The main experiment uses Euclidean distance, which retains differences in vector magnitude as well as direction. The hashing route later uses angular similarity. Those choices need separate exact reference results rather than an assumption that they rank every picture identically.</p>
                <KeepInMind>
                  {"An exact reference uses a specified distance, neighbor count and tie policy. Changing any of those can change the returned list. Each approximate route is compared with the exact reference for its own distance."}
                </KeepInMind>
              </SubSection>

              <SubSection title="3. One distance by hand">
                <p>
                  Every entry of that list rests on one sum, done the same way
                  for each of the 4000 pictures. Take held-out picture 0 and the
                  picture the search put nearest it, collection picture 2072,
                  also a cross, subtract their sixteen numbers one pair at a
                  time, square each gap and add the squares.
                </p>
                <WorkedExample title="Picture 0 against its nearest picture">
                  <PictureDistanceLedger />
                  <p>
                  {"The squared coordinate differences total 0.278769. Their square root gives 0.5280 using the rounded displayed coordinates, compared with 0.5278 from the full-precision search. The seventh, twelfth and second coordinates contribute 0.072361, 0.069169 and 0.058564: together 0.200094, about 72 percent of the squared distance. That percentage describes the squared sum, rather than 72 percent of the final Euclidean distance."}
                </p>
                </WorkedExample>
                <KeepInMind>
                  A distance between two pictures here is sixteen subtractions,
                  sixteen squares and one sum. That is small, and Part 2 is about
                  how many times it has to be done.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. How often the neighbors share the kind" id="4-how-often-the-neighbours-share-the-kind">
                <p>
                  {"We need a way to judge whether retrieved pictures match the query. Here each picture has a known shape label. Count the returned neighbors with the query’s label, divide by k, and average across the 240 queries. This is precision at k under our label-based definition of relevance. A uniformly random collection picture would match the query’s shape one quarter of the time."}
                </p>
                <Equation>{"precision at k  =  (1 / 240)  Σ over questions q of  (how many of q’s k nearest share q’s kind) / k"}</Equation>
                <NumberTable
                  headings={["k", "precision at k", "questions whose k all share its kind"]}
                  rows={[
                    ["1", "0.9833", "236 of 240"],
                    ["5", "0.9792", "228 of 240"],
                    ["10", "0.9775", "222 of 240"],
                    ["20", "0.9683", "207 of 240"],
                  ]}
                  caption="Every question against all 4000 pictures, under the network trained from weight seed 0. Chance is 0.25."
                />
                <>
<p>

                  Precision falls a little as k grows, since the twentieth nearest picture is further out than the fifth and further out is where the kinds begin to meet. By kind, at ten neighbors, crosses score 0.9683, squares 0.9800, discs 0.9767 and bars 0.9850. Let the ten vote and the majority kind is the question&rsquo;s own for 0.9875 of the 240, which is higher than the 0.9708 the network scores naming the same 240 pictures with its own last layer, a layer that reads exactly these sixteen numbers.
                </p>
                <p>The neighbor vote and final classifier layer use the same learned features but different decision rules. Their difference on one fit is a measured observation; the retraining comparison below checks whether it persists under the two additional starting seeds.</p>
</>
                <KeepInMind>
                  Precision at k measures agreement with a label, and the kind is
                  the only label these pictures have. It says the positions keep
                  the kinds apart; it says nothing about whether two crosses of a
                  similar size and place come out nearer each other than two
                  crosses that differ.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. When the nearest picture is another kind">
                <>
<p>
                  Four of the 240 questions have a nearest picture of another kind. Held-out picture 16, a cross, has a disc nearest at 0.7969 and only three crosses among its ten; picture 35, a bar, has a disc at 1.0619 and two bars among its ten; picture 140, a cross, has a disc at 0.7080 and six crosses; and picture 185, a square, has a bar at 1.0721 and not one square among its ten.
                </p>
                <p>

                  Use the playground button to inspect each query beside its returned neighbors. All four nearest distances exceed picture zero&apos;s 0.5278. That suggests these query representations have less nearby support in this particular collection, which is useful context when judging the matches.
                </p>
</>
                <p>These are exact nearest neighbors under the chosen vectors and distance. A wrong shape label therefore exposes a limitation of that representation or comparison, rather than a missed geometric neighbor. We will measure an approximate index by recall against the exact neighbor list, while keeping semantic agreement with the query&apos;s kind as a separate measure of the complete retrieval system.</p>
                <KeepInMind>

                  A neighbor of the wrong kind in the exact answer is a fact
                  about the positions. An index is judged against the exact
                  answer, wrong kinds included.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. The same questions under other starting weights">
                <p>
                  Every figure so far depends on one trained network, and a
                  network trained from different starting weights gives every
                  picture a different position. So the table trains it again from
                  two other weight seeds and asks the same 240 questions of the
                  same 4000 pictures. Every widget on the page draws seed 0.
                </p>
                <SearchSeedTable />
                <>
<p>
                  {"Across the three seeds, precision at ten is 0.9775, 0.9646 and 0.9779. Opening two of 32 cells recovers 0.9583, 0.9404 and 0.9450 of the exact ten neighbors. These repeat fits show the variation for three starts; they do not establish how every retraining will behave. The neighbor-vote comparison from section 4 holds in all three."}
                </p>
                <p>
                  Seed 1&rsquo;s network names only 0.9208 of the held-out pictures correctly with its own last layer, while the single nearest picture in its sixteen numbers shares the kind 0.9917 of the time, so a network whose own answer is its weakest of the three still arranged its pictures as well as the others did.
                </p>
</>
                <KeepInMind>
                  Across three starting weights the nearest picture shares the
                  question&rsquo;s kind more often than the network&rsquo;s own
                  answer is right, 0.9833 against 0.9708, 0.9917 against 0.9208
                  and 0.9917 against 0.9667.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. What the Exact Answer Costs",
          content: (
            <>
              <SubSection title="7. Every picture, for every question">
                <p>An exhaustive scan measures all 4000 collection vectors for one query. At sixteen coordinates each, the stated operation-count model charges 64000 coordinate contributions, and 240 queries require 960000 distances. Those counts describe this scan rather than a lower bound for every exact search: an index with valid distance bounds can sometimes skip candidates safely. The scan still provides our straightforward exact reference.</p>
                <Equation>{"cost of one question  =  N × d  =  4000 × 16  =  64 000 multiply-adds\ncost of Q questions   =  Q × N × d  =  240 × 4000 × 16  =  15 360 000"}</Equation>
                <InAModel title="A collection of a million pictures">
                  <p>
                    The same arithmetic on a million pictures at this width is
                    16 million multiply-adds for every question, and a wider
                    vector multiplies it again. A collection that grows by a
                    thousand pictures a day adds sixteen thousand multiply-adds to
                    every question asked of it from then on, which is the
                    problem every method after the exact scan was invented to
                    avoid.
                  </p>
                </InAModel>
                <KeepInMind>
                  {"The exhaustive reference computes one distance per collection picture for each query. Doubling the collection doubles that scan count. An exact index can sometimes skip candidates using additional bounds; approximation is another way to reduce the work."}
                </KeepInMind>
              </SubSection>

              <SubSection title="8. Why no picture can be skipped without more structure">
                <p>
                  Suppose the search has measured every picture but one and
                  found a best so far. Nothing it has measured says anything
                  about the last picture, which could sit anywhere in the
                  sixteen-dimensional space, including right on top of the
                  question, so the only way to know is to measure it. Skipping a
                  picture safely needs something known in advance that says how
                  near that picture can possibly be, and a plain list of vectors
                  carries no such thing.
                </p>
                <p>

                  The something is usually a stored distance to a landmark. If a
                  picture x is known to be a distance d(c, x) from a center c,
                  then once the question&rsquo;s distance to c is measured, the
                  triangle inequality puts a floor under d(q, x) without
                  computing it, and every picture whose floor is already beyond
                  the best found can be passed over.
                </p>
                <Equation>{"d(q, x)  ≥  d(q, c) − d(c, x)\n\nskip x whenever  d(q, c) − d(c, x)  >  the k-th best distance found so far"}</Equation>
                <p>

                  Bentley&rsquo;s k-d tree uses boxes as its landmarks and the
                  inverted file uses k-means centers, and no tree is built on
                  this page. There is one difference worth holding on to before
                  Part 3. A search that skips only what the bound rules out is
                  still exact. The inverted file as it is used in practice, and
                  as it is built here, does not check the bound at all, and
                  simply stops after a fixed number of cells, which is why it can
                  miss.
                </p>
                <KeepInMind>
                  An exact search may skip a picture only when a lower bound on
                  its distance already exceeds the answer. The inverted file
                  skips by position rather than by bound, and trades exactness
                  for a cost it can set in advance.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Choosing the k nearest once every distance is in">
                <p>After computing the 4000 distances, we need only the smallest k, not a full ordering of the collection. A partition algorithm separates the selected prefix from the remaining distances, then the implementation sorts that prefix. Partitioning need not literally inspect the data in one pass, and equal-distance candidates still need the tie policy discussed below.</p>
                <Equation>{"sort everything     ≈  N log₂ N  =  4000 × 12  ≈  48 000 comparisons\nsplit at the k-th   ≈  a few × N,  then k log₂ k  to order the k"}</Equation>
                <p>
                  The split also shows how sharp the answer is. For picture 0
                  the tenth nearest is 0.7691 away and the eleventh 0.8108, a gap
                  of 0.0417, so asking for ten rather than eleven was a real
                  choice there. Where the tenth and eleventh are at the same
                  distance, the set of the ten nearest stops being one set, which
                  is one of the cases Part 6 takes up.
                </p>
                <KeepInMind>
                  {"After distances are available, partitioning selects a candidate prefix and sorting orders its k results. This avoids sorting all 4000 distances. Approximate indexes reduce the candidates whose distances must be ranked; the partition need not take literally one pass."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "The index comparisons measure how many exact nearest-neighbor IDs are recovered, separately from how many returned pictures share the query’s class.",
              true,
              "Index recall uses the complete distance scan as its reference. Same-class retrieval is a different test of the representation. If both the returned list and reference contain k IDs, precision and recall against that exact-ID set have the same denominator and value. Class-based precision instead uses class relevance, which can give a different result. State which reference is being measured.",
            ),
            choice(
              "Four of the 240 questions have a nearest picture of another kind. What does that tell you?",
              [
                "The network’s arrangement disagrees with the label there, since each answer really is the nearest position in the collection",
                "The search made a mistake on four questions where the collection is thin",
                "An index would do better on those four, since it skips some of the wrong pictures",
                "The network had memorized those four questions during training",
              ],
              0,
              "The exact scan really does place a different-class picture nearest for those queries. An approximate index is judged on recovering that distance-based answer, even when its class is unhelpful. Improving class retrieval would require changing the representation, distance or ranking criterion. An approximation could happen to return a same-class item, but that would not make it a more accurate nearest-neighbor search.",
            ),
            several(
              "The same 240 questions were asked of the same 4000 pictures under three networks trained from different starting weights. Which of these did that report?",
              [
                              "The ten nearest share the question’s kind 0.9775, 0.9646 and 0.9779 of the time across the three",
                              "Seed 1’s network names only 0.9208 of the held-out pictures correctly with its own last layer, while its single nearest picture shares the kind 0.9917 of the time",
                              "Two cells of the inverted file recover the same 0.9583 of the true ten under every seed",
                              "Seed 1 has the lowest same-kind nearest-neighbor rate of the three networks",
                            ],
              [0, 1],
              "A network trained from different starting weights gives every picture a different position, which is exactly why the three seeds are worth running. Two cells of the inverted file recover 0.9583, 0.9404 and 0.9450 of the true ten across them, three different figures that agree closely rather than one repeated, so neither headline figure belongs to one lucky network. Seed 1 names only 0.9208 with its own last layer and its nearest picture still shares the kind 0.9917 of the time, as often as under any of the three, so the weakest namer arranged its pictures as well as the others did.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Same 240 queries against the same 4,000 pictures:\n                                     seed 0  seed 1  seed 2\nprecision at 10                       0.9775  0.9646  0.9779\nrecall at 10, two of 32 cells opened  0.9583  0.9404  0.9450\n\nSeed 1 classifier held-out accuracy: 0.9208\nSeed 1 nearest picture shares query kind: 0.9917\nThe other seeds do not exceed this nearest-kind rate."
              },
            ),
            choice(
              "An exact search has measured every picture but one and has a best so far. Why can it not skip the last one?",
              [
                "Nothing it has measured says anything about that picture, which could sit right on top of the question, and a plain list of vectors carries nothing that bounds it",
                "Because the k-th best distance is not known until every picture has been measured",
                "Because sixteen subtractions and one sum are cheap enough that skipping saves nothing",
                "Because the pictures are stored in no particular order",
              ],
              0,
              "Skipping safely needs something known in advance that says how near a picture can possibly be. That something is usually a stored distance to a landmark, which with the triangle inequality puts a floor under the distance to the question without computing it, and a picture whose floor is already beyond the best found can be passed over.",
            ),
            trueFalse(
              "The inverted file as it is built here is still an exact search, since it skips only what a bound has ruled out.",
              false,
              "This index opens a fixed number of nearest-center cells without proving that all other cells are too far away. It can therefore miss exact neighbors. Fixing the cell count controls one part of its work, but candidate counts still vary with cell occupancy and the selected query cells. A valid lower-bound pruning rule could preserve exactness; that is not the search built here.",
            ),
        ],
        },
        {
          title: "Part 3. The Inverted File",
          content: (
            <>
              <SubSection title="10. Cutting the collection into cells with k-means">
                <p>The inverted file first fits 32 k-means centers to the 4000 vectors. Each vector is assigned to a nearest center, and each cell stores the IDs assigned to it: its inverted list. A new query can use the same nearest-center rule. On an equal-distance boundary, a tie rule is needed to select one cell; the geometry alone need not make that assignment unique.</p>
                <Equation>{"cell(x)  =  the c among the centres μ₁ … μ₃₂ that makes  ‖x − μ_c‖  smallest"}</Equation>
                <p>

                  Here k-means runs from three seedings and keeps the best, which
                  settled in 46 rounds, and the 32 cells hold between 44 and 356
                  pictures each, none of them empty. The map under the playground
                  draws every picture on the two directions of greatest spread,
                  which keep 70.8% of it, with the cell centers as open circles.
                  The cells follow the pictures, several to each kind, since
                  k-means puts centers where the pictures are dense and knows
                  nothing about kinds.
                </p>
                <KeepInMind>

                  The cells are fixed before any question is asked, and they cost
                  one k-means fit over the whole collection. A picture added
                  later goes into the cell of its nearest center, and the centers
                  stay where they were.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Searching only the nearest cells">
                <p>

                  A question is first measured against the 32 centers, which
                  ranks the cells by how near their centers are. The search then
                  opens the nearest few cells, measures only the pictures listed
                  in them, and returns the k nearest of those. How many cells it
                  opens is the one setting it has, and the playground slider
                  moves it.
                </p>
                <WorkedExample title="Picture 0 with one cell of 32">
                  <p>

                    Picture 0&rsquo;s nearest center is 0.6667 away and its cell
                    lists 80 pictures. The search measures 32 centers and then
                    those 80 pictures, and all ten of the true nearest are among
                    them.
                  </p>
                  <Equation>{"distances  =  centres + pictures in the opened cells  =  32 + 80  =  112,   against 4000\n\nrecall at 10  =  |index answer ∩ exact answer| / 10  =  10 / 10  =  1.0"}</Equation>
                </WorkedExample>
                <p>
                  Recall is what an index is scored by from here on. It is the
                  share of the exact k nearest that the index also returned, so
                  an index that found the same ten pictures scores one, whatever
                  their kinds, and an index that found ten other pictures scores
                  zero even if they are all of the right kind.
                </p>
                <KeepInMind>

                  The inverted file costs one distance per center plus one per
                  picture in the opened cells. For picture 0 that was 112
                  distances where the exact answer took 4000, and it lost nothing.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Recall against the share read">
                <p>
                  {"For picture 0, one cell contains every exact neighbor requested. Across all 240 queries, one cell recovers 0.8329 of the exact ten while reading 4.2% of the collection; 121 queries recover all ten. Recall improves as more cells are opened in this sweep, reaching every requested neighbor for every query at six cells."}
                </p>
                <NumberTable
                  headings={["cells opened, of 32", "recall at 10", "questions given all ten", "share read", "distances per question"]}
                  rows={[
                    ["1", "0.8329", "121", "4.2%", "201.9"],
                    ["2", "0.9583", "196", "8.1%", "357.7"],
                    ["3", "0.9825", "217", "11.5%", "490.9"],
                    ["4", "0.9958", "234", "14.7%", "618.8"],
                    ["6", "1.0000", "240", "20.1%", "834.1"],
                  ]}
                  caption="Averaged over the 240 held-out questions. Distances include the 32 centers."
                />
                <RecallTradeOffChart />
                <p>
                  The chart sets every setting at its recall and its share read.
                  For now read the solid lines, which are the inverted file at
                  16, 32 and 64 cells; the dashed ones are Part 4&rsquo;s. Every
                  solid line rises steeply and then flattens, and a reader
                  choosing a setting is choosing a point on that tradeoff curve.
                </p>
                <KeepInMind>
                  Two cells of 32 recover 0.9583 of the true ten while reading
                  8.1% of the collection. The last few percent of recall cost more
                  reading than the first ninety.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Why the nearest cell is not enough">
                <>
<p>

                  The average hides a question for which one cell recovers nothing at all. Held-out picture 46, a disc, is nearest the center of a cell of 181 pictures, 0.8160 away, and not one of its ten true nearest is in that cell. Five of them are in a cell whose center is 0.8877 away and five in one whose center is 0.8929 away, so its three nearest centers are within 0.0769 of one another, and the question sits close to where all three cells meet.
                </p>
                <p>
                  The playground&rsquo;s button for the question one cell serves worst loads it.
                </p>
</>
                <Equation>{"the k nearest all lie within  r_k  of q      (for picture 46,  r₁₀ = 0.4853)\n\none cell is guaranteed enough if that ball lies inside q’s own cell"}</Equation>
                <p>
                  {"A second cell recovers half of this query’s ten exact neighbors, and a third recovers all of them. A nearby center does not guarantee that its cell contains the nearest pictures. When the neighborhood crosses a cell boundary, additional cells may contain useful candidates even though their centers rank later."}
                </p>
                <KeepInMind>
                  {"Picture 46 recovers none of its exact ten from one cell, half from two and all from three. The average one-cell recall is 0.8329, so the average hides this complete miss. Inspect difficult individual queries as well as the curve."}
                </KeepInMind>
              </SubSection>

              <SubSection title="14. How many cells">
                <p>
                  {"The cell count is chosen when building the index. More cells can give a finer grouping, while also adding center comparisons. In these three fits, the finer grouping recovers more exact neighbors at roughly 8% of the collection read."}
                </p>
                <NumberTable
                  headings={["cells", "opened", "share read", "recall at 10", "distances per question"]}
                  rows={[
                    ["16", "1", "8.0%", "0.8742", "336.2"],
                    ["32", "2", "8.1%", "0.9583", "357.7"],
                    ["64", "4", "8.1%", "0.9842", "388.8"],
                  ]}
                  caption="The three cuts at about the same share read. The distances include the centers, 16, 32 or 64 of them."
                />
                <p>

                  The finer cut costs in two other places. Every question
                  measures every center, so 64 cells add 48 distances a question
                  to what 16 cells charge, and the k-means fit that builds the
                  cells has more centers to place, though at 64 cells it settled
                  in 26 rounds against 50 for 16. The smallest of the 64 cells
                  holds 16 pictures, which matters once k is larger than a cell,
                  as Part 6 says.
                </p>
                <KeepInMind>

                  At about 8% read, 16 cells recover 0.8742, 32 cells 0.9583 and
                  64 cells 0.9842. The finer cut pays for that in centers, which
                  every question measures.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The cells are uneven, and questions land in the large ones">
                <p>
                  {"If the 32 cells each held 125 pictures, one cell would contain 3.1 percent of the collection. One-cell queries here read 4.2 percent on average instead. Actual cells range from 44 to 356 pictures. Larger cells cost more when opened and may be selected more frequently. The occupancy-proportional model below explains that combined effect under an explicit assumption about where queries arrive."}
                </p>
                <Equation>{"share read with one cell, expected  =  Σ over cells c of (n_c / N) × (n_c / N)  =  Σ n_c² / N²"}</Equation>
                <NumberTable
                  headings={["cells", "if the cells were even", "Σ n_c² / N²", "measured on the 240 questions"]}
                  rows={[
                    ["16", "6.25%", "7.70%", "8.01%"],
                    ["32", "3.125%", "4.12%", "4.25%"],
                    ["64", "1.5625%", "2.22%", "2.22%"],
                  ]}
                  caption="The sum of squared cell shares is the reading a question drawn like the collection should expect from its first cell."
                />
                <WhyThisWorks title="Why uneven cells always read more">
                  <p>
                  {"Under the model that a query selects a cell in proportion to its occupancy, the expected read share is the sum of squared cell shares above. The Cauchy–Schwarz inequality makes it smallest when occupancies are equal. Uneven cells increase that modeled expectation; a different query distribution can give a different measured cost."}
                </p>
                </WhyThisWorks>
                <KeepInMind>
                  {"Cell sizes and query frequency jointly determine reading cost. A large cell matters most when queries often cause it to be opened. The occupancy model is one assumption about that frequency, not a guarantee about every deployment."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Part 3",
          quiz: [
            choice(
              "Averaged over the 240 questions, what does opening the single nearest cell of 32 recover?",
              [
                "0.8329 of the true ten, while reading 4.2% of the collection",
                "0.9583 of the true ten, while reading 8.1% of the collection",
                "All ten, since a question always falls in the cell holding its neighbors",
                "0.4583 of the true ten, while reading 2.2% of the collection",
              ],
              0,
              "121 of the 240 questions get all ten from one cell, and each further cell buys less than the one before it, with every question getting every one of its ten by six cells. Picture 0 was one of the easy ones, since its cell of 80 held all ten of its true nearest, 112 distances with the 32 centers against 4000 for the exact answer. Two cells are what recover 0.9583 while reading 8.1%, so the last few percent of recall cost more reading than the first ninety.",
            ),
            trueFalse(
              "Held-out picture 46 sits in the cell of the center it is nearest and still recovers none of its ten from that one cell.",
              true,
              "The rule was followed exactly, its nearest center is 0.8160 away, and not one of its ten true nearest is in that cell. Its three nearest centers sit within 0.0769 of one another, so it is close to where all three cells meet, and the ball holding its ten nearest, 0.4853 in radius, reaches over into cells whose centers are a little further off. A second cell recovers half of its ten and a third recovers all of them.",
            ),
            choice(
              "At about 8% of the collection read, how do cuts of 16, 32 and 64 cells compare on recall at ten?",
              [
                "16 cells recover 0.8742, 32 cells 0.9583 and 64 cells 0.9842",
                "All three recover about the same, since the share read is the same",
                "The coarser cut recovers more, since each cell it opens holds more pictures",
                "16 cells recover 0.9842, 32 cells 0.9583 and 64 cells 0.8742",
              ],
              0,
              "At the measured candidate share, the finer partitions recover more exact neighbors in this comparison. They also require more center comparisons and can produce small candidate cells. That is a tradeoff observed for these fitted indexes, not a guarantee that adding more cells always improves recall at fixed work.",
            ),
            choice(
              "If the 32 cells held 125 pictures each, one cell would be 3.1% of the collection, and opening one reads 4.2% on average. Why the gap?",
              [
                "The cells are uneven, from 44 pictures to 356, and a question falls into a cell in proportion to how many pictures that cell holds, so the large cells are opened more often and cost more each time",
                "The 32 centers are counted into the share read",
                "Some questions open more than one cell before answering",
                "Empty cells are skipped, which raises the average size of the rest",
              ],
              0,
              "The cells have unequal sizes. If a collection row is chosen uniformly and its own cell is opened, larger cells are selected more often; the expected candidate share is the sum of squared cell sizes divided by squared collection size. That statistic is at least the equal-size share. Actual independent queries can select cells at different rates, so their measured candidate share need not equal this occupancy statistic.",
            ),
            several(
              "Which of these hold of the cells as they are built here?",
              [
                              "They are fixed before any question is asked, and cost one k-means fit over the whole collection",
                              "A picture added later goes into the cell of its nearest center, and the centers stay where they were",
                              "A question that was never in the collection still falls in exactly one cell",
                              "The 32 centers were placed using the four kinds, so each kind has its own group of cells",
                            ],
              [0, 1, 2],
              "k-means uses positions rather than class labels. Assignment to the nearest fixed center defines the cells, and the stated tie rule makes assignment unique even on a boundary. Later pictures can be inserted using these centers without refitting, although changing distributions may eventually make the index less effective.",
              {
                "description": "Build a 32-center k-means index without class labels. Keep these centers fixed for later inserts and queries. Assign each point to a nearest center; resolve exact distance ties by choosing the lowest center index. A query need not already be in the collection."
              },
            ),
        ],
        },
        {
          title: "Part 4. Hashing by Random Hyperplanes",
          content: (
            <>
              <SubSection title="16. A bit for each side of a plane">
                <p>
                  The second route draws its cuts at random and never looks at
                  the pictures. Draw a plane through the origin of the
                  sixteen-dimensional space in a random direction, and give every
                  picture a one if its vector lies on one side and a zero if it
                  lies on the other. Twelve planes give every picture a code of
                  twelve bits, pictures with the same code share a bucket, and a
                  question is searched only against its own bucket and those
                  close to it.
                </p>
                <Equation>{"bitⱼ(v)  =  1 if rⱼ · v > 0,  else 0,        rⱼ drawn from a standard normal in each of the 16 numbers\n\nP( bitⱼ(u) = bitⱼ(v) )  =  1 − θ(u, v) / π"}</Equation>
                <HyperplaneCodes />
                <p>
                  {"For picture 0, the nearest picture by angle is again picture 2072, at 10.1°. Their codes agree on 11 of 12 bits, compared with an expected count of 11.33. A square at 80.0° agrees on 6 bits, with 6.66 expected; a bar at 118.3° agrees on 4, with 4.11 expected. The twelve independent plane draws produce a random count, which need not equal its expectation."}
                </p>
                <WhyThisWorks title="Why one plane separates two vectors with probability θ / π">
                  <p>
                    Only the part of the random direction lying in the flat
                    plane spanned by u and v decides the two bits, and a
                    standard normal direction looks the same after any rotation,
                    so that part points at an angle drawn evenly around the
                    circle. The two bits differ exactly when the line
                    perpendicular to it passes between u and v, which happens for
                    an arc of 2θ out of the whole turn of 2π, so the probability
                    of different bits is θ / π and of the same bit is one less
                    that.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  A hyperplane code measures angle and ignores length, so it
                  stands in for cosine distance, not the straight-line distance of
                  Parts 1 to 3. Its buckets are scored against the exact nearest
                  by angle.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Checking the probability on these pictures">
                <p>
                  Let&apos;s check the collision probability numerically. For each comparison between picture zero and 200 collection pictures, the widget draws 2000 fresh planes and records how often both vectors fall on the same side. It compares that frequency with the angular formula. The mean discrepancy is 0.0059 and the largest is 0.0232, showing the sampling variation in this experiment.
                </p>
                <Equation>{"spread of a share of 2000 fair coin flips  ≤  √(0.25 / 2000)  =  0.0112"}</Equation>
                <p>
                  {"The stated spread is an upper bound on one sampled agreement fraction’s standard error. The observed mean gap is about half that bound, and the largest of the 200 gaps is about twice it. These differences are consistent with finite sampling; this check illustrates the formula rather than proving a simultaneous error guarantee for every pair."}
                </p>
                <KeepInMind>
                  Over 200 pairs and 2000 planes each, the measured agreement
                  stays within 0.0232 of one minus the angle over π, and within
                  0.0059 on average.
                </KeepInMind>
              </SubSection>

              <SubSection title="18. Buckets, and how far from its own to look">
                <p>
                  Twelve planes allow 4096 codes, and the 4000 pictures use only
                  341 of them, the busiest holding 274 pictures. Searching only
                  the question&rsquo;s own bucket recovers 0.4583 of the true ten
                  by angle while reading 2.2% of the collection, so the method
                  looks further, to every code within one bit of the
                  question&rsquo;s, then within two, and the number of buckets
                  to look in grows quickly.
                </p>
                <Equation>{"codes within r bits of a b-bit code  =  Σ from i = 0 to r of C(b, i)\n\n12 bits, r = 2:   1 + 12 + 66  =  79 buckets"}</Equation>
                <NumberTable
                  headings={["planes", "within", "buckets looked in", "recall at 10", "share read"]}
                  rows={[
                    ["8", "0 bits", "1", "0.6125", "5.1%"],
                    ["8", "1 bit", "9", "0.9179", "15.7%"],
                    ["12", "0 bits", "1", "0.4583", "2.2%"],
                    ["12", "1 bit", "13", "0.7971", "7.4%"],
                    ["12", "2 bits", "79", "0.9408", "14.6%"],
                    ["16", "2 bits", "137", "0.8858", "8.6%"],
                    ["16", "3 bits", "697", "0.9612", "14.1%"],
                  ]}
                  caption="Averaged over the 240 questions, against the exact ten nearest by angle."
                />
                <p>

                  More planes make each bucket smaller and more alike, and they
                  make the neighborhood of a code larger. At sixteen planes a
                  search within four bits looks in 2517 buckets, when only 659
                  of the 65536 possible codes are used by any picture at all, so
                  most of the looking finds nothing.
                </p>
                <KeepInMind>
                  {"Increasing the search radius opens a binomially growing number of possible codes. Many may be empty. Bucket lookups, candidate distances and recall are separate costs to measure; a bucket count alone does not establish runtime."}
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Against the inverted file">
                <p>
                  {"The plotted inverted-file settings recover more of their exact reference neighbors at similar read shares. Four of 32 cells read 14.7% and recover 0.9958; twelve planes within two bits read 14.6% and recover 0.9408; sixteen planes within three bits read 14.1% and recover 0.9612. Remember that the inverted file targets Euclidean neighbors and the hashing route targets angular neighbors. These are comparisons of each method against its own task, not identical returned lists."}
                </p>
                <>
<p>
                  {"K-means fits its cells to the collection; the random planes do not use the collection when choosing directions. Eleven of the sixteen feature means are positive, so this collection is not centered at the origin. A plane through the origin can put many pictures on the same side. Such an unbalanced bit may distinguish fewer candidates, but the coordinate means alone do not prove the cause of the recall gap."}
                </p>
                <p>
                  At eight planes the busiest bucket holds 481 pictures, 12% of the collection. The two routes are also scored against two exact answers, the nearest by distance and the nearest by angle, and those share 0.8017 of their ten, so the comparison is between two methods each doing its own job.
                </p>
</>
                <p>Random hyperplanes need no fit over the collection, and twelve plane tests give a new picture its twelve-bit code. For nonzero vectors, the shared-bit probability follows their angle under the stated random-direction model. That property is independent of the collection, but it does not by itself establish the recall or runtime of a finite bucket search.</p>
                <KeepInMind>
                  {"At roughly one seventh of the collection read, four of 32 cells recover 0.9958 of their exact Euclidean neighbors and twelve-plane hashing recovers 0.9408 of its exact angular neighbors. Fitted cells and random planes use different partitions and different comparison tasks."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. When an Index Stops Helping",
          content: (
            <>
              <SubSection title="20. The nearest against the farthest">
                <p>When distances to many candidates become similar, geometric bounds can become less selective. The nearest-to-farthest distance ratio is one diagnostic of that concentration. A ratio near one means those extreme distances are close together; a small ratio means they differ substantially. It is evidence about this geometry, rather than a complete prediction of every index&apos;s performance.</p>
                <Equation>{"ratio(q)  =  min over x of d(q, x)  /  max over x of d(q, x)"}</Equation>
                <ConcentrationChart />
                <p>
                  On the picture vectors the ratio averages 0.0775. On vectors of
                  the same sixteen numbers drawn evenly between −1 and 1 it
                  averages 0.3230, and as the random vectors widen it rises,
                  0.5982 at 64 numbers, 0.7798 at 256 and 0.8842 at 1024, where
                  the nearest of 4000 points is only 12% nearer than the
                  farthest. The raw pixels of the same pictures, 256 numbers
                  each, average 0.2243.
                </p>
                <KeepInMind>
                  On random vectors the nearest and farthest approach each other
                  as the width grows, 0.0072 at two numbers and 0.8842 at 1024.
                  The pictures&rsquo; sixteen numbers do not behave like random
                  sixteen numbers at all.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The same inverted file on random vectors">
                <p>The right-hand panel compares the same 32-cell index on the picture vectors and on 4000 random vectors with 16 or 64 coordinates. It measures how opening more cells changes recall of the exact ten. This tests the index under those distributions, rather than deriving its recall from the distance ratio alone.</p>
                <NumberTable
                  headings={["cells opened, of 32", "picture vectors, 16", "random, 16", "random, 64"]}
                  rows={[
                    ["1", "0.8329", "0.3113", "0.1404"],
                    ["2", "0.9583", "0.4837", "0.2408"],
                    ["4", "0.9958", "0.6921", "0.3917"],
                    ["8", "1.0000", "0.8692", "0.5833"],
                    ["16", "1.0000", "0.9763", "0.8325"],
                    ["24", "1.0000", "0.9983", "0.9621"],
                  ]}
                  caption="Recall of the true ten, averaged over 240 questions each. Each cell opened reads about the same share of the collection in all three columns."
                />
                <p>
                  {"For the random vectors with 64 coordinates, recall 0.96 requires opening 24 of 32 cells and reading 75.3 percent of the collection. Including center comparisons gives 3045.8 distances per query versus 4000 for the exact scan. That is a smaller count at the cost of missed neighbors; deciding whether it is worthwhile also requires the application’s accuracy requirements and measured runtime."}
                </p>
                <KeepInMind>

                  The same index that recovers 0.9583 of the pictures&rsquo;
                  neighbors from two cells recovers 0.4837 of random
                  sixteen-number neighbors and 0.2408 of random sixty-four-number
                  ones, while each cell opened reads about the same share of the
                  collection in all three.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. The dimension that counts is the data’s own">
                <p>
                  {"Both the picture vectors and the first random set have sixteen coordinates, but their variation is distributed differently. Six principal directions account for 90% of the picture vectors’ variance, and the first accounts for 48.7%. The random vectors need fifteen directions for 90%, with 7.0% in the first. These summaries show more concentrated variation for the learned features. They do not, by themselves, prove four separated clusters or describe every detail of the geometry."}
                </p>
                <>
<p>Coordinate count alone does not supply a reliable cutoff for index usefulness. The sixteen-coordinate picture vectors have a useful index in this experiment, while the random controls behave differently. The 256-coordinate raw pixels also have distance ratio 0.2243, below the sixteen-coordinate random baseline. Distribution and representation matter alongside dimension.</p>
                <p>
                  Beyer and his colleagues stated their result under conditions on how the points are drawn, of which independent, identically spread coordinates are the plainest case, and a network&rsquo;s positions for four kinds of shape are nothing like that.
                </p>
</>
                <KeepInMind>
                  {"Coordinate count does not determine index performance on its own. Inspect distance concentration and measure the index’s recall, work and runtime on representative queries. The random controls show why a rule based on dimensions alone can mislead."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Missing Candidates, Tied Distances and Empty Cells", id: "part-6-where-the-search-stops-being-defined",
          content: (
            <>
              <SubSection title="23. Where the exact answer stops being one answer">
                <p>
                  {"Retrieval needs a collection, a requested count and a distance definition. Some cases below have no requested neighbor set; others have several equally valid sets or need a policy for how many results to return. Keeping those cases separate makes the interface behavior clearer."}
                </p>
                <DerivationTable
                  expressionHeading="Collection or neighbor request"
                  reasonHeading="What the retrieval can return"
                  rows={[
                    { expression: "an empty collection", reason: "the nearest of nothing does not exist. A minimum over an empty set is undefined, and any answer returned would be a convention rather than a nearest picture." },
                    { expression: "k of zero", reason: "Returning no neighbors can be a valid request. The displayed precision-at-k and recall-at-k formulas divide by k, so at zero they require an explicit convention rather than ordinary division." },
                    { expression: "k larger than the collection", reason: "the k nearest of fewer than k pictures names a set that is not there. Returning every picture and saying so is one choice and refusing is the other, and the first quietly changes what precision at k means, since the denominator is no longer the number returned." },
                    { expression: "two pictures at exactly the same distance, across the k-th place", reason: "the set of the k nearest is not unique. Any tie rule, earlier in the collection first for instance, picks one of the sets arbitrarily, and recall against that set then depends on the rule rather than on the pictures. For picture 0 the tenth and eleventh are 0.0417 apart and there is nothing to decide." },
                    { expression: "the same picture twice in the collection", reason: "every question meets the tie above for that pair, since both copies are at one distance, and a k of ten can hold a picture twice, which the answer then counts as two neighbors." },
                    { expression: "a question that is itself in the collection", reason: "Its own stored vector has distance zero, possibly tied with a duplicate. For leave-one-out evaluation, exclude that entry by identity. Other applications may intentionally retain it." },
                    { expression: "a question with a different number of coordinates", reason: "the sum of squared gaps pairs the i-th number of one vector with the i-th of the other, so a sixteen-number question against fifteen-number pictures has no distance at all." },
                    { expression: "a vector of length zero, searched by angle", reason: "A zero vector has no defined angle under the cosine formula. The bit rule can still assign it an all-zero code, but that convention does not give angular similarity a defined value. Validate or separately handle such vectors before angular retrieval." },
                  ]}
                />
                <KeepInMind>
                  {"An exact result requires a valid distance and enough candidates for the requested count, unless the API explicitly returns fewer. Equal distances can leave several valid sets of k neighbors. A consistent tie policy selects one for reference comparisons."}
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Which coarse cells will the index search?" id="24-where-the-index-stops-being-defined">
                <p>
                  {"The inverted file chooses and orders cells before ranking their candidates. Hashing assigns bits before choosing buckets. Ties and boundary points need deterministic conventions, while some settings remove all distance savings. The table separates those interface decisions from missing candidates."}
                </p>
                <DerivationTable
                  expressionHeading="Query or coarse-cell condition"
                  reasonHeading="Effect on which pictures are searched"
                  rows={[
                    { expression: "a question equally near two cell centers", reason: "There are two equally nearest centers. This API uses stable center order to choose between them. If the tie crosses the probe cutoff, that choice can change the candidate set and recall; if both tied cells are opened, it does not." },
                    { expression: "a question equally near every cell center", reason: "the order of the cells is undefined from the first place on, so which cells a search of p cells opens is entirely the tie rule’s decision, and the index is no longer choosing by nearness at all." },
                    { expression: "a cell with no pictures in it", reason: "k-means can leave a center that no picture is nearest. Opening it costs the center’s distance and finds nothing, so a search of p cells has really searched p minus one. None of the 16, 32 or 64 cells here came out empty." },
                    { expression: "fewer pictures in the opened cells than k", reason: "the index cannot return k pictures, and recall has a ceiling of the number read over k. The smallest of the 64 cells holds 16 pictures, so a question landing there with one cell opened cannot answer a k of 20." },
                    { expression: "every cell opened", reason: "the index is the exact search plus one distance per center, 4032 distances where the scan takes 4000, and its recall is one. Nothing is saved, and a little is spent." },
                    { expression: "as many cells as pictures", reason: "In the ideal arrangement with one center at each distinct picture vector, center comparisons already perform an exact scan. Duplicate vectors or an unfinished fit need separate handling; a cell count alone does not guarantee one occupied cell per picture." },
                    { expression: "a vector lying exactly on a hyperplane", reason: "A point on the plane needs a bit convention. This implementation assigns zero because its rule tests whether the dot product is strictly positive. For a fixed nonzero vector and a continuously drawn random plane, exact orthogonality has probability zero; having some zero coordinates does not change that. The all-zero vector lies on every plane." },
                    { expression: "a search radius as large as the code", reason: "every bucket is searched, which is the exact scan by angle plus one lookup for each of the 2 to the b codes, most of them empty." },
                  ]}
                />
                <KeepInMind>
                  {"A boundary query can lose neighbors even when every index operation is well defined. Picture 46 retrieves none of its exact ten from one cell. Other rows show ties that need a consistent rule or settings that spend index overhead while scanning the whole collection."}
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            trueFalse(
              "A code of twelve hyperplane bits stands in for the straight-line distance used in Parts 1 to 3.",
              false,
              "It measures angle and ignores length, so it stands in for cosine distance and its buckets are scored against the exact nearest by angle. The two exact answers are not the same list, sharing 0.8017 of their ten, so the comparison on this page is between two methods each doing its own job.",
            ),
            choice(
              "Picture 0’s code agrees with picture 2072’s on 11 of 12 bits where the formula expects 11.33. Why is the count not the expectation?",
              [
                "Each count is twelve coin flips, so counts land near the expectation rather than on it",
                "The formula holds only for vectors of the same length",
                "Twelve planes are too few for the formula to apply at all",
                "The formula describes the angle rather than the bits",
              ],
              0,
              "A finite collection of random planes gives a sampled bit-agreement count rather than its exact expectation. The angular formula predicts the mean over independent isotropic plane draws for nonzero vectors. The reported agreement errors are consistent with finite sampling. The single-pair standard-error reference is not a bound on the largest error across all tested pairs.",
            ),
            choice(
              "Reading about a seventh of the collection, four cells of 32 recover 0.9958 of the true ten and twelve planes within two bits recover 0.9408. Why is the hashing the worse bargain here?",
              [
                "The cells were placed by k-means among the pictures while the planes were drawn through an origin the pictures sit well away from",
                "Twelve bits allow only 4096 codes, which is too few for 4000 pictures",
                "The hashing was scored against the nearest by straight-line distance, which is not the thing it measures",
                "The two routes were asked different questions of the collection",
              ],
              0,
              "11 of the 16 numbers average above zero across the collection, so a random plane through the origin often passes to one side of most of the pictures and gives nearly all of them the same bit, which spends a bit on no distinction. What the hashing has instead is that it needs no fit over the collection and that its probability of a shared bit holds for any pair of vectors whatever the collection looks like, and none of that shows as recall at this size.",
            ),
            several(
              "Which of these hold of the ratio of the nearest distance to the farthest, as measured on this page?",
              [
                              "On the picture vectors it averages 0.0775, so the nearest picture is much nearer than the farthest",
                              "On random vectors it rises with the width, from 0.0072 at two numbers to 0.8842 at 1024",
                              "The raw pixels, with 256 numbers each, give a higher ratio than random vectors of sixteen numbers",
                              "A ratio near one means an index has plenty of far pictures to skip",
                            ],
              [0, 1],
              "A ratio near one means the nearest and farthest distances are close, making them harder to distinguish by distance alone. Here random vectors show that concentration as width rises. The raw pixels have a smaller ratio than random width-16 vectors, despite their larger width, so dimension alone does not predict the observed geometry. This ratio by itself does not prove that every index will fail.",
              {
                "description": "Use these results from the lesson’s experiment. They describe this dataset and run, rather than a guarantee for every model.",
                "data": "Mean nearest-distance / farthest-distance ratio among 4,000 candidates:\nlearned picture vectors, width 16: 0.0775\nraw pixels, width 256: 0.2243\nrandom vectors, width 2: 0.0072\nrandom vectors, width 16: 0.3230\nrandom vectors, width 1024: 0.8842"
              },
            ),
            choice(
              "The rule of thumb says an index stops helping past ten or twenty dimensions. What happened here?",
              [
                "It held for the random vectors and did not hold for the pictures, which have sixteen numbers and an index that works well",
                "It held for both, since the index needed 24 of its 32 cells in each case",
                "It held for the pictures and not for the random vectors",
                "It could not be tested, since the pictures carry only sixteen numbers",
              ],
              0,
              "Six directions hold 90% of the pictures’ spread and the widest holds 48.7% on its own, where random vectors need fifteen of their sixteen for the same 90% and their widest holds 7.0%. The same inverted file that recovers 0.9583 of the pictures’ neighbors from two cells recovers 0.4837 of random sixteen-number neighbors, and on random vectors of 64 numbers reaching 0.96 takes 24 of the 32 cells and reads 75.3% of the collection, where the plain scan is the better method. What decides is how concentrated the collection is, which the count of coordinates does not tell you.",
            ),
        ],
        },
        {
          title: "Questions on Part 6",
          quiz: [
            choice(
              "The inverted file of 32 cells is told to open all 32. What does one question cost, and what is its recall?",
              [
                "4032 distances, the scan’s 4000 and one more per center, at a recall of one",
                "4000 distances at a recall of one, exactly what the scan costs",
                "32 distances, since only the centers are measured",
                "4032 distances at a recall below one, since the cells still skip by position",
              ],
              0,
              "With every cell opened every picture is measured, so nothing can be missed, and the 32 centers were measured on top of that. Nothing is saved and a little is spent. The other end has the same shape, since with as many cells as pictures each center is a picture and measuring the centers is already the exact scan.",
            ),
            trueFalse(
              "When two pictures sit at exactly the same distance across the tenth place, the exact answer is still exact, and it is one of several.",
              true,
              "When a distance tie crosses the kth position, several top-k ID sets are equally valid by distance. A fixed tie rule makes the reference reproducible, but another valid choice can lower ID-based recall against it. Duplicated vectors create equal distances; they affect the selected set only when such a tie crosses its cutoff. The displayed query has a nonzero tenth-to-eleventh gap, so its cutoff is unambiguous.",
            ),
            several(
              "Which of these leave the search with no defined answer, or leave an index unable to return k pictures?",
              [
                              "A collection with no pictures in it",
                              "A question of sixteen numbers asked of pictures with fifteen",
                              "A k of 20 with one cell of the 64 opened, for a question landing in the cell that holds 16 pictures",
                              "A question that is itself one of the pictures in the collection",
                            ],
              [0, 1, 2],
              "A minimum over an empty set does not exist, and the sum of squared gaps pairs each number of one vector with the same number of the other, so vectors of different widths have no distance at all. A cell of 16 pictures cannot supply 20, so recall there has a ceiling of the number read over k. A question that is in the collection does have an answer, itself at a distance of zero, which is correct and says nothing, so a search usually leaves that picture out and asks for the k after it.",
              {
                "description": "Distance pairs each coordinate of one vector with the corresponding coordinate of another. The index can return candidates only from cells it opens. Here no extra search is attempted when a selected cell contains fewer than k pictures."
              },
            ),
        ],
        },
        {
          title: "Practice. Searching the Random Vectors With the Library",
          practice: [
            exercise(
              "Answer one question exactly",
              [
  "This exercise uses seeded synthetic vectors rather than the page’s learned picture vectors: four thousand sixteen-coordinate collection rows and 240 queries. Measure query zero against every collection row with Euclidean distance.",
  "Use the supplied partial-selection procedure to find its ten nearest, sorting the selected candidates. Print those IDs, nearest distance beside direct verification, tenth/eleventh distances and gap, farthest distance, nearest/farthest ratio and the stated multiply-add count."
],
              `import numpy as np
from oop_ml import EuclideanDistance, RowBlock

draw = np.random.default_rng(5)
for width in (2, 16):  # the page draws its two-number vectors first, so the second draw is the one wanted
    collection = draw.uniform(-1.0, 1.0, size=(4000, width))
    questions = draw.uniform(-1.0, 1.0, size=(240, width))
names = [f"number_{position + 1}" for position in range(16)]

# Measure question 0 against the whole collection, split the distances around
# the tenth smallest and sort the ten in front. Print the ten nearest, the
# nearest distance and the same distance by hand, the tenth and the eleventh
# with their gap, the farthest with the nearest over the farthest, and the
# multiply-adds one question costs.`,
              `import numpy as np
from oop_ml import EuclideanDistance, RowBlock

draw = np.random.default_rng(5)
for width in (2, 16):  # the page draws its two-number vectors first, so the second draw is the one wanted
    collection = draw.uniform(-1.0, 1.0, size=(4000, width))
    questions = draw.uniform(-1.0, 1.0, size=(240, width))
names = [f"number_{position + 1}" for position in range(16)]

distances = EuclideanDistance().between(RowBlock(questions[:1], names), RowBlock(collection, names))[0]
ten = np.argpartition(distances, 10)[:10]
ten = ten[np.argsort(distances[ten])]
by_hand = np.sqrt(np.sum((questions[0] - collection[ten[0]]) ** 2))
eleventh = np.sort(distances)[10]
print(f"the ten nearest to question 0 are {ten.tolist()}")
print(f"the nearest is {distances[ten[0]]:.4f} away, and by hand {by_hand:.4f}")
print(f"the tenth is {distances[ten[9]]:.4f} away and the eleventh {eleventh:.4f}, a gap of {eleventh - distances[ten[9]]:.4f}")
print(f"the farthest is {distances.max():.4f} away, so the nearest over the farthest is {distances[ten[0]] / distances.max():.4f}")
print(f"multiply-adds for one question {collection.size}")`,
              `the ten nearest to question 0 are [3452, 3569, 3658, 3087, 1775, 2928, 2813, 62, 229, 2381]
the nearest is 1.6156 away, and by hand 1.6156
the tenth is 1.8944 away and the eleventh 1.9095, a gap of 0.0151
the farthest is 4.7502 away, so the nearest over the farthest is 0.3401
multiply-adds for one question 64000`,
              { hints: [
  "Keep synthetic collection IDs as row indices and exclude no collection row unless the supplied query contract says so.",
  "Partial selection finds the candidate set; sort that set for ordered output. The complete distance scan remains the reference for later approximation."
], check: numberCheck("How far away is the nearest vector to question 0, to four places?", 1.6156, 0.0005, "The nearest synthetic vector is 1.6156 away. The independent coordinate-difference calculation verifies the exact-scan reference used by later approximate searches."), question: "Can a complete scan establish the exact nearest-neighbor reference?" },
            ),
            exercise(
              "Build the inverted file and sweep the cells opened",
              [
  "Fit the synthetic collection’s k-means index with thirty-two cells, three initializations and seed zero. Keep the starter’s exact ten neighbors for every query as ground truth.",
  "Print smallest/largest cell sizes and the supplied size-weighted one-cell occupancy statistic. Then open 1, 2, 4, 8, 16 and 24 nearest-center cells, reporting mean exact-ten recall, fraction of collection candidates read and mean distance evaluations including center comparisons. The occupancy statistic and query-measured candidate share are different measurements."
],
              `import numpy as np
from oop_ml import EuclideanDistance, Feature, KMeans, RowBlock

draw = np.random.default_rng(5)
for width in (2, 16):  # the page draws its two-number vectors first, so the second draw is the one wanted
    collection = draw.uniform(-1.0, 1.0, size=(4000, width))
    questions = draw.uniform(-1.0, 1.0, size=(240, width))
names = [f"number_{position + 1}" for position in range(16)]

distances = EuclideanDistance().between(RowBlock(questions, names), RowBlock(collection, names))
exact = np.argsort(distances, axis=1, kind="stable")[:, :10]

# Fit KMeans to the collection as one Feature per column, and read each
# vector's cell off the fit. Count the cell sizes and print the smallest, the
# largest and the expected share read by one cell. Rank the cells for every
# question by the squared distance from the question to each centre.

for opened in (1, 2, 4, 8, 16, 24):
    recalls, read = [], []
    for question in range(240):
        # Gather the vectors in this question's nearest cells, keep the ten
        # of them nearest the question, and record the share of the exact ten
        # found and how many vectors were read.
        pass
    # Print the mean recall, the share read and the distances per question.`,
              `import numpy as np
from oop_ml import EuclideanDistance, Feature, KMeans, RowBlock

draw = np.random.default_rng(5)
for width in (2, 16):  # the page draws its two-number vectors first, so the second draw is the one wanted
    collection = draw.uniform(-1.0, 1.0, size=(4000, width))
    questions = draw.uniform(-1.0, 1.0, size=(240, width))
names = [f"number_{position + 1}" for position in range(16)]

distances = EuclideanDistance().between(RowBlock(questions, names), RowBlock(collection, names))
exact = np.argsort(distances, axis=1, kind="stable")[:, :10]

fitted = KMeans(n_clusters=32, n_initialisations=3, random_seed=0).fit([Feature(name, collection[:, at]) for at, name in enumerate(names)])
cell_of = np.asarray(fitted.clustering.labels, dtype=int)
sizes = np.bincount(cell_of, minlength=32)
print(f"cells hold between {sizes.min()} and {sizes.max()} vectors, and one cell is expected to read {np.sum(sizes**2) / 4000**2:.4f}")
nearest_cells = np.argsort(fitted.centroids.squared_distances_to(RowBlock(questions, names)), axis=1, kind="stable")

for opened in (1, 2, 4, 8, 16, 24):
    recalls, read = [], []
    for question in range(240):
        members = np.flatnonzero(np.isin(cell_of, nearest_cells[question, :opened]))
        found = members[np.argsort(distances[question, members], kind="stable")][:10]
        recalls.append(np.isin(exact[question], found).mean())
        read.append(members.size)
    print(f"{opened:2d} cells: recall {np.mean(recalls):.4f}, share read {np.mean(read) / 4000:.4f}, distances {32 + np.mean(read):.1f}")`,
              `cells hold between 94 and 151 vectors, and one cell is expected to read 0.0316
 1 cells: recall 0.3113, share read 0.0313, distances 157.1
 2 cells: recall 0.4837, share read 0.0629, distances 283.7
 4 cells: recall 0.6921, share read 0.1254, distances 533.7
 8 cells: recall 0.8692, share read 0.2514, distances 1037.7
16 cells: recall 0.9763, share read 0.5026, distances 2042.5
24 cells: recall 0.9983, share read 0.7519, distances 3039.5`,
              { hints: [
  "Build candidate IDs from the union of selected cells, then rank actual candidates by their query distance.",
  "Recall compares returned IDs with the exact-ten set. Count center comparisons separately before adding candidate comparisons."
], check: numberCheck("What share of the collection do 24 of the 32 cells read on these vectors, to four places?", 0.7519, 0.0005, "The query-measured candidate fraction is 0.7519 at twenty-four cells. This empirical fraction differs from the separately reported size-weighted occupancy statistic."), question: "How much exact-neighbor recall is lost when only a few index cells are searched?" },
            ),
            exercise(
              "Measure the nearest against the farthest as the vectors widen",
              [
  "For each supplied width, draw four thousand uniform collection vectors and then 240 queries from the single generator seeded with five, continuing its state across widths as in the starter.",
  "Print mean nearest distance, mean farthest distance, their mean gap and mean per-query nearest/farthest ratio. Average the individual ratios, not the ratio of two averages."
],
              `import numpy as np
from oop_ml import EuclideanDistance, RowBlock

draw = np.random.default_rng(5)
for width in (2, 16, 64, 256, 1024):
    names = [f"number_{position + 1}" for position in range(width)]
    collection = draw.uniform(-1.0, 1.0, size=(4000, width))
    questions = draw.uniform(-1.0, 1.0, size=(240, width))
    # Measure every question against every vector, take each question's
    # nearest and farthest distance, and print their means, the mean gap
    # between them and the mean of nearest over farthest.`,
              `import numpy as np
from oop_ml import EuclideanDistance, RowBlock

draw = np.random.default_rng(5)
for width in (2, 16, 64, 256, 1024):
    names = [f"number_{position + 1}" for position in range(width)]
    collection = draw.uniform(-1.0, 1.0, size=(4000, width))
    questions = draw.uniform(-1.0, 1.0, size=(240, width))
    distances = EuclideanDistance().between(RowBlock(questions, names), RowBlock(collection, names))
    nearest, farthest = distances.min(axis=1), distances.max(axis=1)
    print(
        f"{width:4d} numbers: nearest {nearest.mean():.4f}, farthest {farthest.mean():.4f}, "
        f"gap {np.mean(farthest - nearest):.4f}, ratio {np.mean(nearest / farthest):.4f}"
    )`,
              `   2 numbers: nearest 0.0151, farthest 2.1261, gap 2.1110, ratio 0.0072
  16 numbers: nearest 1.5055, farthest 4.6613, gap 3.1558, ratio 0.3230
  64 numbers: nearest 4.8010, farthest 8.0269, gap 3.2259, ratio 0.5982
 256 numbers: nearest 11.3932, farthest 14.6113, gap 3.2181, ratio 0.7798
1024 numbers: nearest 24.4989, farthest 27.7089, gap 3.2100, ratio 0.8842`,
              { hints: [
  "Preserve draw order and seeding so the comparison matches its fixtures.",
  "Keep one nearest and farthest measurement per query before reducing them across queries."
], check: numberCheck("How far apart are the nearest and the farthest on average at 1024 numbers, to four places?", 3.21, 0.0005, "The mean distance gap is 3.2100 at width 1024. The relative contrast shrinks as distances themselves grow; the absolute gap alone hides that change."), question: "How does random-vector width change nearest/farthest distance contrast?" },
            ),
            exercise(
              "Check the probability of a shared bit",
              [
  "Use query zero and the first two hundred synthetic collection vectors. Convert cosine distance to angle, then compute each pair’s expected same-side probability using the supplied formula.",
  "Draw two thousand standard-normal planes at seed zero and compare the sign bits of query/vector projections. Print angle range, mean/largest absolute agreement error and the supplied maximum single-pair standard-error reference."
],
              `import numpy as np
from oop_ml import CosineDistance, RowBlock

draw = np.random.default_rng(5)
for width in (2, 16):  # the page draws its two-number vectors first, so the second draw is the one wanted
    collection = draw.uniform(-1.0, 1.0, size=(4000, width))
    questions = draw.uniform(-1.0, 1.0, size=(240, width))
names = [f"number_{position + 1}" for position in range(16)]

planes = np.random.default_rng(0).standard_normal((2000, 16))
# Get the 200 angles from CosineDistance and the share of planes the formula
# expects to agree. Give the question and the 200 vectors their bits, measure
# the share of planes agreeing for each pair, and print the range of the
# angles in degrees, the mean and largest gap, and the square root of 0.25
# over 2000.`,
              `import numpy as np
from oop_ml import CosineDistance, RowBlock

draw = np.random.default_rng(5)
for width in (2, 16):  # the page draws its two-number vectors first, so the second draw is the one wanted
    collection = draw.uniform(-1.0, 1.0, size=(4000, width))
    questions = draw.uniform(-1.0, 1.0, size=(240, width))
names = [f"number_{position + 1}" for position in range(16)]

planes = np.random.default_rng(0).standard_normal((2000, 16))
apart = CosineDistance().between(RowBlock(questions[:1], names), RowBlock(collection[:200], names))[0]
angles = np.arccos(1 - apart)
expected = 1 - angles / np.pi
question_bits = planes @ questions[0] > 0
vector_bits = collection[:200] @ planes.T > 0
measured = (vector_bits == question_bits).mean(axis=1)
gaps = np.abs(measured - expected)
print(f"the 200 angles run from {np.degrees(angles.min()):.1f} to {np.degrees(angles.max()):.1f} degrees")
print(f"mean gap {gaps.mean():.4f}, largest gap {gaps.max():.4f}")
print(f"spread of a share of 2000 coin flips, at most {np.sqrt(0.25 / 2000):.4f}")`,
              `the 200 angles run from 49.2 to 130.0 degrees
mean gap 0.0098, largest gap 0.0299
spread of a share of 2000 coin flips, at most 0.0112`,
              { hints: [
  "Clip cosine into its valid range before arccos.",
  "For each pair, average its bit agreements across planes. The reference is a single-pair variability scale, not a simultaneous maximum-error guarantee."
], check: numberCheck("What is the mean absolute difference between measured and expected same-side shares over the two hundred pairs?", 0.0098, 0.0005, "The mean absolute agreement discrepancy is 0.0098 over these pairs. Finite random-plane sampling need not equal its angular probability exactly."), question: "Do random hyperplane bits agree at the rate predicted by the pair’s angle?" },
            ),
          ],
        },
      ]}
    />
  );
}
