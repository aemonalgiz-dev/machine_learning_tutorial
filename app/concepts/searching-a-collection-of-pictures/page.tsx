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

export const metadata: Metadata = {
  title: "Searching a Collection of Pictures · oop_ml",
  description:
    "Compare exact neighbour search with indexes that inspect fewer candidate pictures.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function SearchingACollectionOfPicturesPage() {
  return (
    <ConceptPage
      lessonId="searching-a-collection-of-pictures"
      intuition={lessonIntuitions["searching-a-collection-of-pictures"]}
      technicalStart="Part 2. What the Exact Answer Costs"
      openingTitle="A Useful Similarity Measure Still Has to Search the Collection"
      playgroundIntro="Compare each indexed result with the exact neighbours. Read the number of comparisons together with recall, the share of exact neighbours recovered."
      title="Searching a Collection of Pictures"
      tagline="Compare exact neighbour search with indexes that inspect fewer candidate pictures."
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
            k-nearest neighbours
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
<p>
                  Every picture on this page is sixteen pixels a side and holds one of four shapes, a cross, a square outline, a filled disc or a diagonal bar, drawn at a random place, size and brightness with a little noise over every pixel. The network from the page on a vector for a picture reads each one and, one layer before it names the shape, answers with sixteen numbers, and those sixteen numbers are the picture&rsquo;s position.
                </p>
                <p>
                  Finding the pictures most like a given one becomes finding the positions nearest its position, and no pixel is compared again.
                </p>
</>
                <Equation>{"picture  →  network  →  v  =  (v₁, v₂, …, v₁₆),     each vᵢ between −1 and 1"}</Equation>
                <>
<p>
                  The collection searched is 4000 pictures, 1000 of each kind, drawn under a seed of 11, which is far more than the 240 the network learned from, and a forward pass costs little enough that drawing more is free. The questions are the other 240 pictures of the network&rsquo;s own draw, 60 of each kind, the half it was scored on and never trained on, so no question is a picture the network memorised and none of them is in the collection.
                </p>
                <p>
                  Each of the sixteen numbers comes out of a hyperbolic tangent and so lies between −1 and 1, and the collection&rsquo;s vectors average a length of 3.03, against the 4 a vector sitting in a corner of that range would have, so most pictures push most of their sixteen numbers close to one end or the other.
                </p>
</>
                <KeepInMind>
                  A search here never looks at a pixel. It compares sixteen
                  numbers the network produced, so alike means alike to a
                  network trained to tell four kinds apart, and to nothing else.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. What a search returns">
                <p>
                  Ask for the pictures nearest held-out picture 0, a cross, and
                  the answer is a list, the k pictures of the collection whose
                  positions are closest to its position, nearest first. The
                  playground shows that list for any question, each picture
                  framed in the colour of its kind, and for picture 0 all ten of
                  the nearest are crosses. The nearest is 0.5278 away and the
                  tenth 0.7691 away, while the farthest picture in the
                  collection is 5.3240 away.
                </p>
                <Equation>{"d(q, x)  =  √( Σᵢ (qᵢ − xᵢ)² )\n\nanswer(q, k)  =  the k pictures x of the collection with the smallest d(q, x), nearest first"}</Equation>
                <p>
                  This is the search the k-nearest neighbours page votes with,
                  with the vote taken away, since here the neighbours are the
                  answer. Straight-line distance is the choice made throughout,
                  because the network&rsquo;s sixteen numbers are all on one
                  scale and a picture&rsquo;s length carries something, how hard
                  the network committed to it. Part 4 measures by angle instead,
                  for a reason that belongs to that route.
                </p>
                <KeepInMind>
                  The exact answer is fixed by one distance and one k. Change
                  either and it is a different question with a different answer,
                  and every index on this page is scored against the answer to
                  the question as asked.
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
                    The squares add to 0.278769 and its square root is 0.5280
                    from the rounded coordinates, against the exact 0.5278 the
                    search used. Three of the sixteen gaps, the seventh, the
                    twelfth and the second, carry 0.072361, 0.069169 and
                    0.058564, which is 0.200094 of the 0.278769, or 72% of the
                    whole distance from three numbers.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  A distance between two pictures here is sixteen subtractions,
                  sixteen squares and one sum. That is small, and Part 2 is about
                  how many times it has to be done.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. How often the neighbours share the kind">
                <p>
                  There is no person on hand to say whether the pictures a
                  search returns look like the question, so the page judges them
                  by the one thing every picture carries, its kind. For each
                  question we count how many of its k nearest are of the same
                  kind, divide by k, and average over the 240 questions, which is
                  called precision at k. If the positions carried nothing, a
                  neighbour would share the kind a quarter of the time.
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
                  Precision falls a little as k grows, since the twentieth nearest picture is further out than the fifth and further out is where the kinds begin to meet. By kind, at ten neighbours, crosses score 0.9683, squares 0.9800, discs 0.9767 and bars 0.9850. Let the ten vote and the majority kind is the question&rsquo;s own for 0.9875 of the 240, which is higher than the 0.9708 the network scores naming the same 240 pictures with its own last layer, a layer that reads exactly these sixteen numbers.
                </p>
                <p>
                  I had expected the vote to do no better than that layer, and section 6 checks whether the difference survives a retrain.
                </p>
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
                  The button in the playground steps through them, and it is worth looking at each question beside what came back, since all four nearest distances are larger than picture 0&rsquo;s 0.5278, which puts these questions where the collection is thin.
                </p>
</>
                <p>
                  None of the four is a mistake by the search. Each answer is
                  exactly the nearest position in the collection, measured
                  against every picture there is, so the disagreement is between
                  the network&rsquo;s arrangement and the label, and no index can
                  do better on this measure than the exact answer does. That is
                  why the rest of the page scores an index by recall, how much of
                  the exact answer it finds, and never by precision, which would
                  mix what the index lost with what the network got wrong.
                </p>
                <KeepInMind>
                  A neighbour of the wrong kind in the exact answer is a fact
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
                  The ten nearest share the question&rsquo;s kind 0.9775, 0.9646 and 0.9779 of the time across the three seeds, and two cells of the inverted file recover 0.9583, 0.9404 and 0.9450 of the true ten, so neither headline figure belongs to one lucky network. The comparison from section 4 held on all three seeds and grew on one of them.
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
                <p>
                  To be sure which picture is nearest, the search has to measure
                  every picture, since the one it skips could have been the
                  nearest. For one question that is 4000 distances of sixteen
                  numbers each, 64000 multiply-adds, and for the 240 questions
                  it is 960000 distances. None of that is slow at this size. What
                  matters is how it grows, one full pass over the collection for
                  every question, so the cost of a question rises in step with
                  the collection and never falls.
                </p>
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
                  The exact answer costs one distance per picture per question.
                  Doubling the collection doubles what every question costs, and
                  nothing about the pictures can lower it without more structure.
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
                  picture x is known to be a distance d(c, x) from a centre c,
                  then once the question&rsquo;s distance to c is measured, the
                  triangle inequality puts a floor under d(q, x) without
                  computing it, and every picture whose floor is already beyond
                  the best found can be passed over.
                </p>
                <Equation>{"d(q, x)  ≥  d(q, c) − d(c, x)\n\nskip x whenever  d(q, c) − d(c, x)  >  the k-th best distance found so far"}</Equation>
                <p>
                  Bentley&rsquo;s k-d tree uses boxes as its landmarks and the
                  inverted file uses k-means centres, and no tree is built on
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
                <p>
                  With all 4000 distances measured, the k smallest still have to
                  be picked out. Sorting all 4000 would put every picture in
                  order, which is more than the question asks, since only the
                  first k matter. The search behind this page splits the
                  distances around the k-th smallest, which takes one pass of a
                  few comparisons per picture, and then sorts only the k in front
                  of it.
                </p>
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
                  Once the 4000 distances are in, picking the ten smallest takes
                  one pass and a sort of ten, so every index on this page saves
                  distances and leaves the choosing as it was.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            trueFalse(
              "Every index on this page is scored by recall, the share of the exact answer it also found, and never by precision at k.",
              true,
              "Precision would mix what the index lost with what the network got wrong, and an index that returned ten pictures of the right kind but not the right ten would score well on it. Recall scores the index against the exact answer, wrong kinds included, since a neighbour of the wrong kind in the exact answer is a fact about the positions and no index can do better on that measure than the exact answer does.",
            ),
            choice(
              "Four of the 240 questions have a nearest picture of another kind. What does that tell you?",
              [
                "The network’s arrangement disagrees with the label there, since each answer really is the nearest position in the collection",
                "The search made a mistake on four questions where the collection is thin",
                "An index would do better on those four, since it skips some of the wrong pictures",
                "The network had memorised those four questions during training",
              ],
              0,
              "Each of the four answers was measured against every picture there is, so no index can do better on that measure than the exact answer does. All four of those nearest distances are larger than picture 0’s 0.5278, which puts the questions where the collection is thin, and a neighbour of the wrong kind in the exact answer is a fact about the positions rather than a fault to be fixed.",
            ),
            several(
              "The same 240 questions were asked of the same 4000 pictures under three networks trained from different starting weights. Which of these did that report?",
              [
                "The ten nearest share the question’s kind 0.9775, 0.9646 and 0.9779 of the time across the three",
                "Seed 1’s network names only 0.9208 of the held-out pictures correctly with its own last layer, while its single nearest picture shares the kind 0.9917 of the time",
                "Two cells of the inverted file recover the same 0.9583 of the true ten under every seed",
                "The network that is weakest at naming its held-out pictures also arranged them worst for the search",
              ],
              [0, 1],
              "A network trained from different starting weights gives every picture a different position, which is exactly why the three seeds are worth running. Two cells of the inverted file recover 0.9583, 0.9404 and 0.9450 of the true ten across them, three different figures that agree closely rather than one repeated, so neither headline figure belongs to one lucky network. Seed 1 names only 0.9208 with its own last layer and its nearest picture still shares the kind 0.9917 of the time, as often as under any of the three, so the weakest namer arranged its pictures as well as the others did.",
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
              "It does not check the bound at all. It opens a fixed number of cells and stops, which is why it can miss, and it is also what lets it set its cost in advance. A search that skips only what a bound rules out would stay exact, and no tree of that kind is built on this page.",
            ),
        ],
        },
        {
          title: "Part 3. The Inverted File",
          content: (
            <>
              <SubSection title="10. Cutting the collection into cells with k-means">
                <p>
                  The inverted file does some of the work once, before any
                  question arrives. It runs k-means over the 4000 positions to
                  find 32 centres, puts every picture in the cell of the centre it
                  is nearest, and keeps, for each cell, the list of pictures in
                  it. That list is the inverted list the method is named after,
                  and each cell stands for a region of the space, every point of
                  which is nearer its centre than any other centre, so a question
                  that was never in the collection still falls in exactly one
                  cell.
                </p>
                <Equation>{"cell(x)  =  the c among the centres μ₁ … μ₃₂ that makes  ‖x − μ_c‖  smallest"}</Equation>
                <p>
                  Here k-means runs from three seedings and keeps the best, which
                  settled in 46 rounds, and the 32 cells hold between 44 and 356
                  pictures each, none of them empty. The map under the playground
                  draws every picture on the two directions of greatest spread,
                  which keep 70.8% of it, with the cell centres as open circles.
                  The cells follow the pictures, several to each kind, since
                  k-means puts centres where the pictures are dense and knows
                  nothing about kinds.
                </p>
                <KeepInMind>
                  The cells are fixed before any question is asked, and they cost
                  one k-means fit over the whole collection. A picture added
                  later goes into the cell of its nearest centre, and the centres
                  stay where they were.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. Searching only the nearest cells">
                <p>
                  A question is first measured against the 32 centres, which
                  ranks the cells by how near their centres are. The search then
                  opens the nearest few cells, measures only the pictures listed
                  in them, and returns the k nearest of those. How many cells it
                  opens is the one setting it has, and the playground slider
                  moves it.
                </p>
                <WorkedExample title="Picture 0 with one cell of 32">
                  <p>
                    Picture 0&rsquo;s nearest centre is 0.6667 away and its cell
                    lists 80 pictures. The search measures 32 centres and then
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
                  The inverted file costs one distance per centre plus one per
                  picture in the opened cells. For picture 0 that was 112
                  distances where the exact answer took 4000, and it lost nothing.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. Recall against the share read">
                <p>
                  Picture 0 was an easy question. Averaged over all 240, opening
                  the nearest cell recovers 0.8329 of the true ten while reading
                  4.2% of the collection, and 121 questions get all ten. Each
                  further cell buys less than the one before it, and by six cells
                  every question gets every one of its ten.
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
                  caption="Averaged over the 240 held-out questions. Distances include the 32 centres."
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
                  The average hides a question for which one cell recovers nothing at all. Held-out picture 46, a disc, is nearest the centre of a cell of 181 pictures, 0.8160 away, and not one of its ten true nearest is in that cell. Five of them are in a cell whose centre is 0.8877 away and five in one whose centre is 0.8929 away, so its three nearest centres are within 0.0769 of one another, and the question sits close to where all three cells meet.
                </p>
                <p>
                  The playground&rsquo;s button for the question one cell serves worst loads it.
                </p>
</>
                <Equation>{"the k nearest all lie within  r_k  of q      (for picture 46,  r₁₀ = 0.4853)\n\none cell is enough only if that ball lies inside q’s own cell"}</Equation>
                <p>
                  A second cell recovers half of its ten and a third recovers all
                  of them. Nearness to a centre and nearness to the pictures a
                  cell holds are different things, and they part company exactly
                  where a question sits near a boundary, since the ball holding
                  its ten nearest then reaches over into cells whose centres are
                  a little further off.
                </p>
                <KeepInMind>
                  A question near the edge of its cell has neighbours on the
                  other side of the edge. Held-out picture 46 recovers none of
                  its ten from one cell, half from two and all from three, while
                  the average over the 240 questions at one cell reads 0.8329.
                </KeepInMind>
              </SubSection>

              <SubSection title="14. How many cells">
                <p>
                  The number of cells is set when the index is built. More,
                  smaller cells follow the pictures more closely, so for the same
                  share read a finer cut recovers more, and the table sets the
                  three cuts side by side at roughly 8% of the collection read.
                </p>
                <NumberTable
                  headings={["cells", "opened", "share read", "recall at 10", "distances per question"]}
                  rows={[
                    ["16", "1", "8.0%", "0.8742", "336.2"],
                    ["32", "2", "8.1%", "0.9583", "357.7"],
                    ["64", "4", "8.1%", "0.9842", "388.8"],
                  ]}
                  caption="The three cuts at about the same share read. The distances include the centres, 16, 32 or 64 of them."
                />
                <p>
                  The finer cut costs in two other places. Every question
                  measures every centre, so 64 cells add 48 distances a question
                  to what 16 cells charge, and the k-means fit that builds the
                  cells has more centres to place, though at 64 cells it settled
                  in 26 rounds against 50 for 16. The smallest of the 64 cells
                  holds 16 pictures, which matters once k is larger than a cell,
                  as Part 6 says.
                </p>
                <KeepInMind>
                  At about 8% read, 16 cells recover 0.8742, 32 cells 0.9583 and
                  64 cells 0.9842. The finer cut pays for that in centres, which
                  every question measures.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. The cells are uneven, and questions land in the large ones">
                <p>
                  If 32 cells held 125 pictures each, one cell would be 3.1% of
                  the collection, and yet opening one cell reads 4.2% on average.
                  The cells are uneven, from 44 pictures to 356, and a question
                  drawn the way the collection was drawn falls into a cell in
                  proportion to how many pictures that cell holds, so the large
                  cells are opened more often than the small ones and each time
                  they are opened they cost more.
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
                    For C cells holding n_c pictures that add to N, the
                    Cauchy&ndash;Schwarz inequality gives Σ n_c² ≥ N² / C, with
                    equality only when every cell holds N / C. So the expected
                    reading of one cell is at least one over the number of cells,
                    and it exceeds that by more the more uneven the cells are.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The cost of opening a cell is not the same for every question.
                  The busy regions of the collection are both where questions
                  arrive and where the cells are largest.
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
                "All ten, since a question always falls in the cell holding its neighbours",
                "0.4583 of the true ten, while reading 2.2% of the collection",
              ],
              0,
              "121 of the 240 questions get all ten from one cell, and each further cell buys less than the one before it, with every question getting every one of its ten by six cells. Picture 0 was one of the easy ones, since its cell of 80 held all ten of its true nearest, 112 distances with the 32 centres against 4000 for the exact answer. Two cells are what recover 0.9583 while reading 8.1%, so the last few percent of recall cost more reading than the first ninety.",
            ),
            trueFalse(
              "Held-out picture 46 sits in the cell of the centre it is nearest and still recovers none of its ten from that one cell.",
              true,
              "The rule was followed exactly, its nearest centre is 0.8160 away, and not one of its ten true nearest is in that cell. Its three nearest centres sit within 0.0769 of one another, so it is close to where all three cells meet, and the ball holding its ten nearest, 0.4853 in radius, reaches over into cells whose centres are a little further off. A second cell recovers half of its ten and a third recovers all of them.",
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
              "More, smaller cells follow the pictures more closely, so for the same share read a finer cut recovers more. The finer cut pays for it in two other places. Every question measures every centre, so 64 cells add 48 distances a question to what 16 charge, and the smallest of the 64 cells holds 16 pictures, which starts to matter once k is larger than a cell.",
            ),
            choice(
              "If the 32 cells held 125 pictures each, one cell would be 3.1% of the collection, and opening one reads 4.2% on average. Why the gap?",
              [
                "The cells are uneven, from 44 pictures to 356, and a question falls into a cell in proportion to how many pictures that cell holds, so the large cells are opened more often and cost more each time",
                "The 32 centres are counted into the share read",
                "Some questions open more than one cell before answering",
                "Empty cells are skipped, which raises the average size of the rest",
              ],
              0,
              "None of the 32 cells is empty, so that is not where the gap comes from. Summing the squared cell sizes over the squared total is the expected reading of one cell, and Cauchy-Schwarz puts it at no less than one over the number of cells, with equality only when every cell holds the same number. The busy regions of the collection are both where questions arrive and where the cells are largest.",
            ),
            several(
              "Which of these hold of the cells as they are built here?",
              [
                "They are fixed before any question is asked, and cost one k-means fit over the whole collection",
                "A picture added later goes into the cell of its nearest centre, and the centres stay where they were",
                "A question that was never in the collection still falls in exactly one cell",
                "The 32 centres were placed using the four kinds, so each kind has its own group of cells",
              ],
              [0, 1, 2],
              "k-means puts centres where the pictures are dense and knows nothing about kinds, so the cells follow the pictures and several of them land on each kind. Each cell stands for a region every point of which is nearer its centre than any other centre, which is what gives an unseen question exactly one cell.",
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
                  The nearest picture to picture 0 by angle is again picture
                  2072, 10.1° away, and its code agrees with picture 0&rsquo;s on
                  11 of the 12 bits, where the formula expects 11.33. A square at
                  80.0° agrees on 6, with 6.66 expected, and a bar at 118.3°
                  agrees on 4, with 4.11 expected. Each count is twelve coin
                  flips, so the counts land near the expectation rather than on
                  it.
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
                  The whole route rests on that one probability, so it is worth
                  checking on these vectors rather than trusting. The widget sets
                  picture 0 against 200 pictures of the collection on 2000 fresh
                  planes each, takes the share of planes that put each pair on
                  the same side, and compares it with one minus the pair&rsquo;s
                  angle over π. The mean gap is 0.0059 and the largest 0.0232.
                </p>
                <Equation>{"spread of a share of 2000 fair coin flips  ≤  √(0.25 / 2000)  =  0.0112"}</Equation>
                <p>
                  The mean gap is about half of that spread and the largest of
                  the 200 gaps about twice it, which is where the largest of two
                  hundred such shares ought to land, so the formula holds on these
                  pictures to within the noise the finite count of planes puts on
                  it.
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
                  make the neighbourhood of a code larger. At sixteen planes a
                  search within four bits looks in 2517 buckets, when only 659
                  of the 65536 possible codes are used by any picture at all, so
                  most of the looking finds nothing.
                </p>
                <KeepInMind>
                  The bucket count to search grows like a binomial sum in the
                  radius. Past a radius of two or three the looking costs more
                  than the pictures it finds.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. Against the inverted file">
                <p>
                  Switch the chart in section 12 to both routes and the dashed
                  lines sit below the solid ones at every share read. Four cells
                  of 32 read 14.7% of the collection and recover 0.9958 of the
                  true ten, twelve planes searched within two bits read 14.6%
                  and recover 0.9408, and sixteen planes within three bits read
                  14.1% and recover 0.9612. On these pictures the hashing is the
                  worse bargain at every share the chart shows.
                </p>
                <>
<p>
                  The cells were placed by k-means where the pictures are, and the planes were drawn without looking. The collection does not sit around the origin, since 11 of the 16 numbers average above zero across it, so a random plane through the origin often passes to one side of most of the pictures and gives nearly all of them the same bit, which spends a bit on no distinction.
                </p>
                <p>
                  At eight planes the busiest bucket holds 481 pictures, 12% of the collection. The two routes are also scored against two exact answers, the nearest by distance and the nearest by angle, and those share 0.8017 of their ten, so the comparison is between two methods each doing its own job.
                </p>
</>
                <p>
                  The hashing has what the cells lack elsewhere. It needs no fit
                  over the collection, a new picture&rsquo;s code is twelve dot
                  products, and the probability of a shared bit holds for any
                  pair of vectors whatever the collection looks like, which is
                  what made it the first route with a guarantee in high
                  dimension. None of that shows as recall at this size.
                </p>
                <KeepInMind>
                  Reading about a seventh of the collection, four cells of 32
                  recover 0.9958 of the true ten and twelve hyperplanes 0.9408,
                  since k-means placed the cells among the pictures while the
                  planes were drawn through an origin the pictures sit well away
                  from.
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
                <p>
                  An index skips pictures because it can tell that they are far
                  from the question. That only works if far and near are very
                  different distances, so the thing to measure is how much nearer
                  the nearest picture is than the farthest. For each question we
                  divide one by the other, and a ratio near zero means the
                  nearest is much nearer than the rest, while a ratio near one
                  means every picture is about as far away as every other.
                </p>
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
                <p>
                  The ratio predicts what an index will do, and the right-hand
                  panel of the chart tests the prediction. The same inverted file
                  of 32 cells, fitted the same way, is run on the pictures and on
                  4000 random vectors of 16 and of 64 numbers, and asked the same
                  question, how much of the true ten a number of cells recovers.
                </p>
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
                  On random vectors of 64 numbers, recovering 0.96 of the true ten
                  takes 24 of the 32 cells, which reads 75.3% of the collection
                  and costs 3045.8 distances a question with the centres. The
                  exact scan costs 4000 and is certain, so for a saving of about
                  a quarter the index gives up about a twenty-sixth of the
                  answer, and in that setting the plain scan is the better
                  method.
                </p>
                <KeepInMind>
                  The same index that recovers 0.9583 of the pictures&rsquo;
                  neighbours from two cells recovers 0.4837 of random
                  sixteen-number neighbours and 0.2408 of random sixty-four-number
                  ones, while each cell opened reads about the same share of the
                  collection in all three.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. The dimension that counts is the data’s own">
                <p>
                  The picture vectors and the first random set both have sixteen
                  numbers, and they behave like different spaces. The difference
                  is in how the sixteen numbers are spread. Six directions hold
                  90% of the pictures&rsquo; spread, and the widest holds 48.7%
                  on its own, while random vectors need fifteen of their sixteen
                  directions for the same 90% and their widest holds 7.0%. The
                  pictures fill a thin, clumped part of their space, four kinds
                  each gathered in its own region, and the random vectors fill
                  all of it.
                </p>
                <>
<p>
                  The rule of thumb that indexes stop helping past ten or twenty dimensions held here for the random vectors and did not hold for the pictures, which have sixteen numbers and an index that works well. The raw pixels make the same point from the other side, with 256 numbers and a ratio of 0.2243, lower than random vectors of sixteen.
                </p>
                <p>
                  Beyer and his colleagues stated their result under conditions on how the points are drawn, of which independent, identically spread coordinates are the plainest case, and a network&rsquo;s positions for four kinds of shape are nothing like that.
                </p>
</>
                <KeepInMind>
                  What decides whether an index helps is how concentrated the
                  collection is, which the count of coordinates does not tell
                  you. Measure the nearest against the farthest before trusting
                  either the index or the rule of thumb.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where the Search Stops Being Defined",
          content: (
            <>
              <SubSection title="23. Where the exact answer stops being one answer">
                <p>
                  The exact search is a minimum taken over the collection, k
                  times over, and a minimum needs something to take it over and
                  a way of telling two candidates apart. Each case below removes
                  one of those, and the table says what the mathematics then
                  says.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    { expression: "an empty collection", reason: "the nearest of nothing does not exist. A minimum over an empty set is undefined, and any answer returned would be a convention rather than a nearest picture." },
                    { expression: "k of zero", reason: "the answer is the empty list, which is defined and useless, and precision at k and recall at k both divide by k, so each is a zero over a zero." },
                    { expression: "k larger than the collection", reason: "the k nearest of fewer than k pictures names a set that is not there. Returning every picture and saying so is one choice and refusing is the other, and the first quietly changes what precision at k means, since the denominator is no longer the number returned." },
                    { expression: "two pictures at exactly the same distance, across the k-th place", reason: "the set of the k nearest is not unique. Any tie rule, earlier in the collection first for instance, picks one of the sets arbitrarily, and recall against that set then depends on the rule rather than on the pictures. For picture 0 the tenth and eleventh are 0.0417 apart and there is nothing to decide." },
                    { expression: "the same picture twice in the collection", reason: "every question meets the tie above for that pair, since both copies are at one distance, and a k of ten can hold a picture twice, which the answer then counts as two neighbours." },
                    { expression: "a question that is itself in the collection", reason: "its nearest picture is itself at a distance of zero. That is correct and says nothing, so a search asked about a picture it holds usually leaves the picture out and asks for the k after it." },
                    { expression: "a question with a different number of coordinates", reason: "the sum of squared gaps pairs the i-th number of one vector with the i-th of the other, so a sixteen-number question against fifteen-number pictures has no distance at all." },
                    { expression: "a vector of length zero, searched by angle", reason: "a vector with no length has no direction, and the cosine divides by the length, so the angle to anything is a zero over a zero. A picture whose sixteen numbers all came out as zero would have no place in Part 4’s search." },
                  ]}
                />
                <KeepInMind>
                  The exact search needs pictures to search, a k no larger than
                  their number, and distances that can tell the k-th from the one
                  after it. Without the last of these the answer is still exact,
                  and it is one of several.
                </KeepInMind>
              </SubSection>

              <SubSection title="24. Where the index stops being defined">
                <p>
                  The inverted file adds two decisions to the exact search, which
                  cell a question belongs to and which cells to open, and the
                  hashing adds one, which side of a plane a vector is on. Each can
                  fail to have an answer, and each has a case where the index
                  stops saving anything.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    { expression: "a question equally near two cell centres", reason: "which cell is nearest is undefined. If the tie falls inside the cells opened nothing turns on it; if it falls at the last cell opened, which cell is searched is a choice, and the recall can differ between the two choices." },
                    { expression: "a question equally near every cell centre", reason: "the order of the cells is undefined from the first place on, so which cells a search of p cells opens is entirely the tie rule’s decision, and the index is no longer choosing by nearness at all." },
                    { expression: "a cell with no pictures in it", reason: "k-means can leave a centre that no picture is nearest. Opening it costs the centre’s distance and finds nothing, so a search of p cells has really searched p minus one. None of the 16, 32 or 64 cells here came out empty." },
                    { expression: "fewer pictures in the opened cells than k", reason: "the index cannot return k pictures, and recall has a ceiling of the number read over k. The smallest of the 64 cells holds 16 pictures, so a question landing there with one cell opened cannot answer a k of 20." },
                    { expression: "every cell opened", reason: "the index is the exact search plus one distance per centre, 4032 distances where the scan takes 4000, and its recall is one. Nothing is saved, and a little is spent." },
                    { expression: "as many cells as pictures", reason: "each cell holds one picture and its centre is that picture, so measuring the centres is already the exact scan and the cells add nothing to it." },
                    { expression: "a vector lying exactly on a hyperplane", reason: "the sign of zero is neither side, so the bit is undefined and a rule has to assign one. Drawn from a continuous distribution this happens with probability zero, and on vectors with exact zeros in them it happens often." },
                    { expression: "a search radius as large as the code", reason: "every bucket is searched, which is the exact scan by angle plus one lookup for each of the 2 to the b codes, most of them empty." },
                  ]}
                />
                <KeepInMind>
                  Every line above has the same shape, a decision the index adds
                  that the data can leave without an answer, or a setting at which
                  the index reads everything and costs more than the scan it was
                  meant to replace. The one worth carrying away is the question
                  near a boundary, since it breaks no rule at all, and held-out
                  picture 46 still recovered none of its ten from one cell.
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
              "Checked over 200 pairs on 2000 fresh planes each, the measured share of planes agreeing stays within 0.0232 of one minus the angle over pi, and within 0.0059 on average, where the spread of a share of 2000 fair coin flips is at most 0.0112. So the formula holds on these pictures to within the noise a finite count of planes puts on it.",
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
              "A ratio near one means every picture is about as far away as every other, which leaves an index nothing it can tell apart, and at 1024 numbers the nearest of 4000 random points is only 12% nearer than the farthest. The raw pixels average 0.2243, below the 0.3230 of random sixteen-number vectors despite having 256 numbers, so the pictures’ sixteen numbers do not behave like random sixteen numbers at all, and the count of coordinates does not decide the question.",
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
              "Six directions hold 90% of the pictures’ spread and the widest holds 48.7% on its own, where random vectors need fifteen of their sixteen for the same 90% and their widest holds 7.0%. The same inverted file that recovers 0.9583 of the pictures’ neighbours from two cells recovers 0.4837 of random sixteen-number neighbours, and on random vectors of 64 numbers reaching 0.96 takes 24 of the 32 cells and reads 75.3% of the collection, where the plain scan is the better method. What decides is how concentrated the collection is, which the count of coordinates does not tell you.",
            ),
        ],
        },
        {
          title: "Questions on Part 6",
          quiz: [
            choice(
              "The inverted file of 32 cells is told to open all 32. What does one question cost, and what is its recall?",
              [
                "4032 distances, the scan’s 4000 and one more per centre, at a recall of one",
                "4000 distances at a recall of one, exactly what the scan costs",
                "32 distances, since only the centres are measured",
                "4032 distances at a recall below one, since the cells still skip by position",
              ],
              0,
              "With every cell opened every picture is measured, so nothing can be missed, and the 32 centres were measured on top of that. Nothing is saved and a little is spent. The other end has the same shape, since with as many cells as pictures each centre is a picture and measuring the centres is already the exact scan.",
            ),
            trueFalse(
              "When two pictures sit at exactly the same distance across the tenth place, the exact answer is still exact, and it is one of several.",
              true,
              "The set of the ten nearest is then not unique. Any tie rule picks one of the sets arbitrarily, and recall against that set depends on the rule and not on the pictures. For picture 0 the tenth and eleventh nearest are 0.0417 apart, so there was nothing to decide, while a picture stored twice in the collection brings the tie to every question, since both copies sit at one distance.",
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
            ),
        ],
        },
        {
          title: "Practice. Searching the Random Vectors With the Library",
          practice: [
            exercise(
              "Answer one question exactly",
              ["The page’s pictures are drawn by the site and placed by a network it trains, so these problems search the other collection the page uses, the random vectors of Part 5, which a seed reproduces exactly. The starter draws them the way the page does, 4000 vectors of sixteen numbers between −1 and 1 and 240 questions. Measure question 0 against every vector with the library’s straight-line distance.", "Pick out the ten nearest the way Part 2 describes, by splitting the 4000 distances around the tenth smallest and sorting only the ten in front of it. Print the ten, the nearest distance beside the same distance worked by hand from the sixteen gaps, the tenth and the eleventh with the gap between them, the farthest, and how many multiply-adds the question cost. Part 2 puts the cost at 64,000 and, for the page’s picture 0, the tenth and eleventh 0.0417 apart."],
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
              { hints: ["A RowBlock pairs a block of rows with the names of its columns, and EuclideanDistance().between takes the questions’ block and then the collection’s and answers one row of distances per question. questions[:1] keeps question 0 as a block of one row.", "np.argpartition(distances, 10) puts the ten smallest in the first ten places in no particular order, in one pass, and sorting only those ten by their distances puts them nearest first.", "By hand, the distance is the square root of the sum of the squared gaps between the question’s sixteen numbers and the vector’s.", "The eleventh nearest distance is the entry at position 10 of the sorted distances, and the cost of one question is one multiply-add for every number in the collection."], check: numberCheck("How far away is the nearest vector to question 0, to four places?", 1.6156, 0.0005, "The nearest of the 4000 is 1.6156 away and the farthest 4.7502, so the nearest is already 0.3401 of the way to the farthest. For the page’s picture 0 the nearest was 0.5278 away and the farthest 5.3240, about a tenth. The tenth and eleventh here are 0.0151 apart where the page’s were 0.0417 apart, so the place where the answer is cut is less sharp on random vectors. The cost is the same 64,000 multiply-adds either way, since it depends only on how many vectors there are and how wide they are.") },
            ),
            exercise(
              "Build the inverted file and sweep the cells opened",
              ["Part 3 cuts the collection into 32 cells with k-means and searches only the cells whose centres are nearest the question, and Part 5 runs that same index on random vectors. Build it on the sixteen-number random vectors. The starter draws them, measures every question against every vector and keeps each question’s exact ten. Fit k-means with 32 clusters, three seedings and a seed of 0, which is how the page fits its own.", "Print the smallest and largest cell and the share of the collection one cell is expected to read, the sum of the squared cell sizes over the squared total from Part 3. Then, opening 1, 2, 4, 8, 16 and 24 cells, print the recall of the true ten averaged over the 240 questions, the share of the collection read and the distances a question costs with the centres counted. Part 5’s table gives the recalls as 0.3113, 0.4837, 0.6921, 0.8692, 0.9763 and 0.9983. The shares read are not on the page."],
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
              { hints: ["KMeans takes its settings when it is built and its data in fit, as a list of Feature, one per column, each a name and that column of the collection. The fit’s clustering.labels holds the cell of every vector.", "The fit’s centroids answer squared_distances_to a RowBlock of questions with one row per question and one column per centre, so sorting each row ranks the cells for that question, nearest first.", "np.isin(cell_of, opened_cells) marks the vectors whose cell is one of those opened, and np.flatnonzero turns the marks into positions in the collection. The distances to them are already in the question’s row of distances.", "Recall is the share of the exact ten that also appear among the ten found, and a question costs one distance per centre plus one per vector read."], check: numberCheck("What share of the collection do 24 of the 32 cells read on these vectors, to four places?", 0.7519, 0.0005, "Opening 24 of 32 cells reads 0.7519 of the collection, 3039.5 distances a question with the centres, to recover 0.9983 of the true ten, and two cells recover 0.4837 where two cells of the page’s pictures recovered 0.9583. The cut itself is not at fault. These cells are nearly even, between 94 and 151 vectors, so one cell is expected to read 0.0316 against 0.03125 for perfectly even cells, where the pictures’ cells ran from 44 to 356. That is Part 5’s point, that what decides whether an index helps is how concentrated the collection is and not how many numbers a vector has.") },
            ),
            exercise(
              "Measure the nearest against the farthest as the vectors widen",
              ["Part 5 divides each question’s nearest distance by its farthest and averages over the questions, on random vectors of 2, 16, 64, 256 and 1024 numbers. Draw each set the way the page does, from one generator seeded with 5, the 4000 vectors of a width first and then its 240 questions, and measure every question against every vector.", "Print, for each width, the mean nearest distance, the mean farthest, the mean gap between them and the mean ratio. The page gives the ratios as 0.0072, 0.3230, 0.5982, 0.7798 and 0.8842, and prints none of the distances behind them."],
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
              { hints: ["EuclideanDistance().between takes a RowBlock of the questions and a RowBlock of the collection, each a block of rows with the names of its columns, and answers 240 rows of 4000 distances.", "Each question’s nearest and farthest are the smallest and largest of its row, and the ratio is taken question by question before it is averaged."], check: numberCheck("How far apart are the nearest and the farthest on average at 1024 numbers, to four places?", 3.21, 0.0005, "From 16 numbers to 1024 the nearest vector moves from 1.5055 away to 24.4989 and the farthest from 4.6613 to 27.7089, so the gap between them hardly moves, 3.1558 and then 3.2100, while the ratio climbs from 0.3230 to 0.8842. The nearest is only 12% nearer than the farthest at 1024 numbers because both distances grew, not because the gap closed. An index skips a vector by telling that it is far, and a gap of about three on distances of twenty-five leaves it little to tell.") },
            ),
            exercise(
              "Check the probability of a shared bit",
              ["The library has no class for hashing by random hyperplanes, and the page’s own code writes it from the definition, a sign for each plane. Do the same on the sixteen-number random vectors. Take question 0 and the first 200 vectors of the collection, get the angle between the question and each from the library’s cosine distance, and work out the share of planes Part 4’s formula expects to put the two on the same side.", "Then draw 2000 planes from a standard normal with a seed of 0, give the question and each vector one bit per plane, and measure the share of planes on which their bits agree. Print the range of the angles, the mean and the largest gap between the measured share and the expected one over the 200 pairs, and the spread Part 4 allows a share of 2000 coin flips. The page found a mean gap of 0.0059 and a largest of 0.0232 on its own pictures."],
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
              { hints: ["CosineDistance().between answers one minus the cosine of the angle, so the angle is the arccosine of one minus the distance, and the share expected to agree is one minus the angle over pi.", "A plane through the origin is one row of sixteen numbers, and a vector’s bit is whether its dot product with that row is above zero. planes @ questions[0] gives the question’s 2000 dot products at once, and collection[:200] @ planes.T gives a row of 2000 for each vector.", "Two rows of bits agree where they are equal, and the mean of that along a row is the share of planes on which the pair agrees."], check: numberCheck("What is the mean gap between the measured and the expected share over the 200 pairs, to four places?", 0.0098, 0.0005, "The mean gap is 0.0098 and the largest 0.0299, against a spread of at most 0.0112 for a share of 2000 coin flips. A mean a little under that spread and a largest of 200 between two and three times it are what the noise of a finite count of planes should give, so the formula holds on these vectors as it did on the page’s pictures, where the gaps were 0.0059 and 0.0232. The 200 angles run from 49.2 to 130.0 degrees, so none of these vectors is close to the question by angle, where the page’s picture 0 had a picture 10.1 degrees away.") },
            ),
          ],
        },
      ]}
    />
  );
}
