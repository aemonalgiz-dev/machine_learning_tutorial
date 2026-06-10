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
import { ConcentrationChart } from "@/components/widgets/ConcentrationChart";
import { HyperplaneCodes } from "@/components/widgets/HyperplaneCodes";
import { PictureDistanceLedger } from "@/components/widgets/PictureDistanceLedger";
import { PictureSearchPlayground } from "@/components/widgets/PictureSearchPlayground";
import { RecallTradeOffChart } from "@/components/widgets/RecallTradeOffChart";
import { SearchSeedTable } from "@/components/widgets/SearchSeedTable";

export const metadata: Metadata = {
  title: "Searching a Collection of Pictures · oop_ml",
  description:
    "Once every picture is a position, finding the ones like this is a nearest-neighbour search. The exact answer measures every picture there is; an inverted file measures a few cells of them and misses a little, by an amount this page measures.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function SearchingACollectionOfPicturesPage() {
  return (
    <ConceptPage
      title="Searching a Collection of Pictures"
      tagline="Nearest-neighbour search over pictures given positions by a network, exactly and through an inverted file, and what the second gives up to avoid measuring every picture."
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
      history={
        <>
          <p>
            The exact answer was the first thing anyone tried to avoid paying
            for. Jon Bentley&rsquo;s 1975 paper in Communications of the ACM,
            &ldquo;Multidimensional binary search trees used for associative
            searching&rdquo;, described the k-d tree, which cuts a set of
            points in half along one coordinate, then cuts each half along the
            next, so that a search can skip a whole branch once the box around
            it is further from the query than the best point found so far.
            Jerome Friedman, Bentley and Raphael Finkel made it a
            nearest-neighbour search in 1977, in &ldquo;An algorithm for
            finding best matches in logarithmic expected time&rdquo;, and the
            logarithm in that title holds for a small, fixed number of
            coordinates, with a cost that climbs steeply as coordinates are
            added, since in many dimensions a ball around the query reaches
            into most of the boxes. Kevin Beyer, Jonathan Goldstein, Raghu
            Ramakrishnan and Uri Shaft asked the sharper question in 1999, in
            &ldquo;When is &lsquo;nearest neighbor&rsquo; meaningful?&rdquo;,
            and showed that under broad conditions on how the points are drawn
            the farthest point is barely further than the nearest once the
            dimension is large, which leaves an index nothing to skip.
          </p>
          <p>
            What came next gave up exactness on purpose. Piotr Indyk and Rajeev
            Motwani&rsquo;s 1998 paper, &ldquo;Approximate nearest neighbors:
            towards removing the curse of dimensionality&rdquo;, proposed
            hashing a point so that near points land in the same bucket more
            often than far ones, and searching only the query&rsquo;s bucket,
            which they called locality-sensitive hashing. Moses Charikar gave
            the version for angles in 2002, in &ldquo;Similarity estimation
            techniques from rounding algorithms&rdquo;, using the random
            hyperplane that Michel Goemans and David Williamson had used in 1995
            to round a solution of the maximum cut problem, and Part 4 checks
            the one probability his argument rests on against these pictures.
          </p>
          <p>
            The inverted file came from text retrieval, where each word points
            to the list of documents containing it. Josef Sivic and Andrew
            Zisserman carried it to pictures in 2003, in &ldquo;Video
            Google&rdquo;, by quantising the small descriptors of a video frame
            with k-means into visual words, so that a frame could be looked up
            the way a document is. Herv&eacute; J&eacute;gou, Matthijs Douze and
            Cordelia Schmid&rsquo;s 2011 paper, &ldquo;Product quantization for
            nearest neighbor search&rdquo;, is the form this page builds the
            first half of, a coarse k-means quantiser whose cells are the
            inverted lists, with only the few cells nearest the query searched;
            their second half compresses each vector inside its cell, and is not
            built here. The graph indexes that followed, the hierarchical
            navigable small world graph of Yury Malkov and Dmitry Yashunin among
            them, walk from point to neighbouring point towards the query
            instead of cutting the space, and they are not built here either.
          </p>
          <p>
            The page asks six questions in order. What does a search for the
            pictures nearest a given picture return, and how often do they share
            its kind? What does the exact answer cost, and why can no picture be
            skipped without more structure? How does an inverted file cut that
            cost, and how much of the true answer does it keep for each share of
            the collection it reads? How does random hyperplane hashing, the
            other route, compare at the same share? Why does an index work on
            these vectors and fail on random vectors of the same width? And
            where does the search stop being defined?
          </p>
        </>
      }
      playground={<PictureSearchPlayground />}
      sections={[
        {
          title: "Part 1. A Picture as a Question",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Four thousand pictures, each sixteen numbers">
                <p>
                  Every picture on this page is sixteen pixels a side and holds
                  one of four shapes, a cross, a square outline, a filled disc or
                  a diagonal bar, drawn at a random place, size and brightness
                  with a little noise over every pixel. The network from the page
                  on a vector for a picture reads each one and, one layer before
                  it names the shape, answers with sixteen numbers, and those
                  sixteen numbers are the picture&rsquo;s position. Finding the
                  pictures most like a given one becomes finding the positions
                  nearest its position, and no pixel is compared again.
                </p>
                <Equation>{"picture  →  network  →  v  =  (v₁, v₂, …, v₁₆),     each vᵢ between −1 and 1"}</Equation>
                <p>
                  The collection searched is 4000 pictures, 1000 of each kind,
                  drawn under a seed of 11, which is far more than the 240 the
                  network learned from, and a forward pass costs little enough
                  that drawing more is free. The questions are the other 240
                  pictures of the network&rsquo;s own draw, 60 of each kind, the
                  half it was scored on and never trained on, so no question is a
                  picture the network memorised and none of them is in the
                  collection. Each of the sixteen numbers comes out of a
                  hyperbolic tangent and so lies between −1 and 1, and the
                  collection&rsquo;s vectors average a length of 3.03, against
                  the 4 a vector sitting in a corner of that range would have,
                  so most pictures push most of their sixteen numbers close to
                  one end or the other.
                </p>
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
                <p>
                  Precision falls a little as k grows, since the twentieth
                  nearest picture is further out than the fifth and further out
                  is where the kinds begin to meet. By kind, at ten neighbours,
                  crosses score 0.9683, squares 0.9800, discs 0.9767 and bars
                  0.9850. Let the ten vote and the majority kind is the
                  question&rsquo;s own for 0.9875 of the 240, which is higher than
                  the 0.9708 the network scores naming the same 240 pictures with
                  its own last layer, a layer that reads exactly these sixteen
                  numbers. I had expected the vote to do no better than that
                  layer, and section 6 checks whether the difference survives a
                  retrain.
                </p>
                <KeepInMind>
                  Precision at k measures agreement with a label, and the kind is
                  the only label these pictures have. It says the positions keep
                  the kinds apart; it says nothing about whether two crosses of a
                  similar size and place come out nearer each other than two
                  crosses that differ.
                </KeepInMind>
              </SubSection>

              <SubSection title="5. When the nearest picture is another kind">
                <p>
                  Four of the 240 questions have a nearest picture of another
                  kind. Held-out picture 16, a cross, has a disc nearest at
                  0.7969 and only three crosses among its ten; picture 35, a bar,
                  has a disc at 1.0619 and two bars among its ten; picture 140, a
                  cross, has a disc at 0.7080 and six crosses; and picture 185, a
                  square, has a bar at 1.0721 and not one square among its ten.
                  The button in the playground steps through them, and it is
                  worth looking at each question beside what came back, since
                  all four nearest distances are larger than picture 0&rsquo;s
                  0.5278, which puts these questions where the collection is
                  thin.
                </p>
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
                <p>
                  The ten nearest share the question&rsquo;s kind 0.9775, 0.9646
                  and 0.9779 of the time across the three seeds, and two cells of
                  the inverted file recover 0.9583, 0.9404 and 0.9450 of the true
                  ten, so neither headline figure belongs to one lucky network.
                  The comparison from section 4 held on all three seeds and grew
                  on one of them. Seed 1&rsquo;s network names only 0.9208 of the
                  held-out pictures correctly with its own last layer, while the
                  single nearest picture in its sixteen numbers shares the kind
                  0.9917 of the time, so a network whose own answer is its
                  weakest of the three still arranged its pictures as well as the
                  others did.
                </p>
                <KeepInMind>
                  Across three starting weights the nearest picture shares the
                  question&rsquo;s kind more often than the network&rsquo;s own
                  answer is right, 0.9833 against 0.9708, 0.9917 against 0.9208
                  and 0.9917 against 0.9667.
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                  choosing a setting is choosing a point on that bend.
                </p>
                <KeepInMind>
                  Two cells of 32 recover 0.9583 of the true ten while reading
                  8.1% of the collection. The last few percent of recall cost more
                  reading than the first ninety.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Why the nearest cell is not enough">
                <p>
                  The average hides a question for which one cell recovers
                  nothing at all. Held-out picture 46, a disc, is nearest the
                  centre of a cell of 181 pictures, 0.8160 away, and not one of
                  its ten true nearest is in that cell. Five of them are in a
                  cell whose centre is 0.8877 away and five in one whose centre
                  is 0.8929 away, so its three nearest centres are within 0.0769
                  of one another, and the question sits close to where all three
                  cells meet. The playground&rsquo;s button for the question one
                  cell serves worst loads it.
                </p>
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
                <p>
                  The cells were placed by k-means where the pictures are, and
                  the planes were drawn without looking. The collection does not
                  sit around the origin, since 11 of the 16 numbers average
                  above zero across it, so a random plane through the origin
                  often passes to one side of most of the pictures and gives
                  nearly all of them the same bit, which spends a bit on no
                  distinction. At eight planes the busiest bucket holds 481
                  pictures, 12% of the collection. The two routes are also scored
                  against two exact answers, the nearest by distance and the
                  nearest by angle, and those share 0.8017 of their ten, so the
                  comparison is between two methods each doing its own job.
                </p>
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
                <p>
                  The rule of thumb that indexes stop helping past ten or twenty
                  dimensions held here for the random vectors and did not hold
                  for the pictures, which have sixteen numbers and an index that
                  works well. The raw pixels make the same point from the other
                  side, with 256 numbers and a ratio of 0.2243, lower than random
                  vectors of sixteen. Beyer and his colleagues stated their
                  result under conditions on how the points are drawn, of which
                  independent, identically spread coordinates are the plainest
                  case, and a network&rsquo;s positions for four kinds of shape
                  are nothing like that.
                </p>
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
      ]}
    />
  );
}
