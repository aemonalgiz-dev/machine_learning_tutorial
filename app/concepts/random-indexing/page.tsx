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
import { DrawToDrawSpread } from "@/components/widgets/DrawToDrawSpread";
import { DrawnDirections } from "@/components/widgets/DrawnDirections";
import { OnePassOrOneProduct } from "@/components/widgets/OnePassOrOneProduct";
import { PerpendicularityCurve } from "@/components/widgets/PerpendicularityCurve";
import { PositionBuildUp } from "@/components/widgets/PositionBuildUp";
import { RandomIndexingPlayground } from "@/components/widgets/RandomIndexingPlayground";
import { ThreeReadingsOfOneCount } from "@/components/widgets/ThreeReadingsOfOneCount";
import { WidthAgainstTheTable } from "@/components/widgets/WidthAgainstTheTable";

export const metadata: Metadata = {
  title: "Random Indexing · oop_ml",
  description:
    "Give every word a fixed random direction, add up the directions a word was seen beside, and never build the table of counts at all.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function RandomIndexingPage() {
  return (
    <ConceptPage
      title="Random Indexing"
      tagline="Random indexing gives every word a fixed random direction and adds up the directions a word was seen beside, so the positions come out at whatever width was asked for and the table of counts they would otherwise have been squeezed out of never exists."
      prerequisites={
        <>
          Every answer on this page is an angle between two lists of numbers,
          which is the{" "}
          <Link href="/concepts/a-vector-for-a-word" className={link}>
            cosine
          </Link>{" "}
          rather than a distance, and the reason two words can be alike without
          either being large. The thing random indexing is a shortcut past is
          the build-a-table-then-squeeze-it shape that{" "}
          <Link href="/concepts/latent-semantic-analysis" className={link}>
            latent semantic analysis
          </Link>{" "}
          uses, so a reader who has met that will recognise the problem in Part
          1 immediately, though nothing later depends on having read it.
        </>
      }
      history={
        <>
          <p>
            Pentti Kanerva had spent the 1980s on a theory of memory built out
            of very long random vectors, published as{" "}
            <em>Sparse Distributed Memory</em> by MIT Press in 1988. The
            property he kept returning to is not obvious and is the whole of
            what this page rests on. In a space of a few thousand dimensions,
            two vectors drawn at random are almost always very nearly
            perpendicular, and almost never close, so a great many items can be
            given directions of their own without any of them interfering much
            with any other. That is a fact about high-dimensional geometry
            rather than about memory, and it had been proved in a sharper form
            by William Johnson and Joram Lindenstrauss in 1984, who showed that
            a random linear map into a surprisingly small number of dimensions
            keeps every distance among a set of points to within a chosen
            factor.
          </p>
          <p>
            The problem it got applied to was a practical complaint about
            latent semantic analysis. That method builds a table with a row for
            every word and a column for every document and then replaces it
            with the nearest table of low rank, and by the late 1990s the
            replacement was the expensive part. The table is as wide as the
            collection and as tall as the vocabulary, it has to exist before
            anything can be done to it, and a new document arriving means
            factorising it again. Kanerva, with Jan Kristoferson and Anders
            Holst, proposed the alternative in &ldquo;Random Indexing of Text
            Samples for Latent Semantic Analysis&rdquo;, in the proceedings of
            the 22nd Annual Conference of the Cognitive Science Society in
            2000. Give every document a fixed random direction, and accumulate,
            for each word, the directions of the documents it turned up in. No
            table is built and no decomposition is run, and a new document adds
            to the existing positions instead of invalidating them.
          </p>
          <p>
            Magnus Sahlgren, then at the Swedish Institute of Computer Science,
            is the reason the method is a method rather than a note. His
            &ldquo;An Introduction to Random Indexing&rdquo; in 2005 and his
            doctoral thesis <em>The Word-Space Model</em> in 2006 set out the
            version used since, in which the context is a window of neighbours
            rather than a whole document, and argued the case against the
            decomposition on its own terms rather than only on cost. Dimitris
            Achlioptas had supplied the missing piece in 2001, in
            &ldquo;Database-friendly random projections&rdquo;, by showing that
            a random map whose entries are only −1, 0 and +1, with most of them
            zero, does the job as well as one drawn from a bell curve, which is
            what makes the accumulation cheap enough to be worth doing. The
            same geometry, under the name hyperdimensional computing, is where
            Kanerva&rsquo;s line of work went next.
          </p>
          <p>
            This page asks six questions in order. Why does every counting
            method build something as wide as the vocabulary and then throw
            most of it away? What exactly does a word&rsquo;s position
            accumulate, and what makes it the same answer? Why does adding up a
            few hundred random directions not turn into a smear? Why are those
            directions almost entirely zeros? What does the shortcut cost
            against the table it never builds? And where does the method stop
            being defined?
          </p>
        </>
      }
      playground={<RandomIndexingPlayground />}
      sections={[
        {
          title: "Part 1. The Table That Only Exists To Be Thrown Away",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Twenty-four documents, and three sentences small enough to check">
                <p>
                  Everything on this page is fitted to one of two collections,
                  and it is worth knowing what is in them before any method
                  touches them. The larger one is twenty-four documents, twelve
                  about cooking and twelve about sailing. The cooking half is
                  written from ten words, flour, sugar, butter, eggs, oven,
                  bake, stir, whisk, dough and pan; the sailing half from ten of
                  its own, sail, wind, boat, harbour, anchor, tide, mast, rope,
                  deck and crew. No subject word appears in both halves. What
                  the halves share is three words carrying no subject at all,
                  and, the and we, and each document uses exactly one of them.
                </p>
                <p>
                  Each document is six words long, five consecutive words of its
                  own half taken in a cycle and one of the three shared words,
                  which comes to 144 word occurrences over 23 distinct words.
                  The arrangement is deliberate, since it makes every word of a
                  half keep the same company as every other word of that half,
                  and so makes the two numbers this page keeps reporting mean
                  something.
                </p>
                <p>
                  The smaller collection is three sentences of three words each,
                  the cat sat, the dog sat and the cat ran. Five distinct words,
                  and every number it produces can be checked by hand, which is
                  what Part 2 uses it for.
                </p>
                <KeepInMind>
                  Nobody tells a fit that a collection has two halves. The two
                  numbers reported throughout, how alike two words of one half
                  come out and how alike a word of each comes out, are the whole
                  score, and both are read off positions that were built without
                  the halves ever being mentioned.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. Counting which word turned up beside which">
                <p>
                  The starting point for every counting method is the same
                  table. Write down one row for each distinct word and one
                  column for each distinct word, and in the cell where a row and
                  a column meet, put how often those two words turned up within
                  a few positions of each other. How few is the window, and five
                  positions on each side is the usual choice; a sentence
                  boundary stops the reach, so nothing outside a document is
                  ever company for anything inside it.
                </p>
                <p>
                  Every pair is counted from both ends, so the table is the same
                  read either way round, and a word&rsquo;s row and its column
                  hold the same numbers. On the twenty-four documents the row of
                  flour totals 30 and the rows of and, the and we total 40 each,
                  which is a fact Part 4 comes back to.
                </p>
                <WorkedExample title="Three sentences, two positions each side">
                  <p>
                    Take the cat sat, the dog sat and the cat ran, and count
                    everything within two positions. In the first sentence the
                    is beside cat and two from sat, cat is beside both, and sat
                    is beside cat and two from the. Do that for all three and
                    the row of the reads 0, 2, 2, 1, 1 against the vocabulary in
                    the order the, cat, sat, dog, ran. The row of cat reads 2,
                    0, 1, 0, 1, and the row of ran reads 1, 1, 0, 0, 0. Twenty
                    five cells for five words, and the whole thing fits on a
                    line.
                  </p>
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
                  It would be reasonable to expect a table of who appeared beside
                  whom to be useful only for pairs that did appear beside each
                  other. It is not, and the reason is the whole point of
                  counting. Two words that never met can still be recognised as
                  alike, because what is compared is not the cell where they
                  meet but their two rows, and two words that keep the same
                  company have similar rows whether or not they ever shared a
                  document.
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
                  This is what makes the table worth reading and also what makes
                  it awkward. The answer wanted from it is never a cell, it is
                  always an angle between two whole rows, so the table has to
                  exist in full before the first question can be asked of it.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. The widest thing in the calculation is the thing nobody wants">
                <p>
                  A row per word and a column per word means the table has as
                  many numbers as the square of the vocabulary. On the
                  twenty-four documents that is 23 by 23, or 529 numbers. But
                  nobody wants 23 numbers a word. The whole family of counting
                  methods squeezes that row down to a handful of coordinates
                  before anybody uses it, and at 16 numbers a word the answer
                  holds 368.
                </p>
                <Equation>{"numbers in the table = V × V"}</Equation>
                <Equation>{"numbers in the answer = V × d"}</Equation>
                <p>
                  So the calculation builds V over d times more numbers than it
                  intends to keep, where V is how many distinct words there are
                  and d is how many coordinates a word is wanted to have. Here
                  that ratio is 23 over 16, which is barely anything, and it is
                  the ratio rather than the difference that grows. The width d
                  stays where it was put whatever the collection is; V does not.
                </p>
                <InAModel>
                  At this size the objection is entirely theoretical, and it is
                  worth saying so plainly. Building 529 numbers to keep 368 is
                  not a hardship. The complaint is about the order of the two
                  steps rather than about their sizes, because the widest object
                  the calculation ever holds is one that exists only so that
                  something much narrower can be got out of it, and it has to be
                  complete before the narrowing can start.
                </InAModel>
                <KeepInMind>
                  There is a second cost hidden in the order, which is that the
                  squeeze is not incremental. A new document changes counts all
                  over the table, and the narrowing has to be redone from the
                  changed table rather than nudged. That is the complaint random
                  indexing was written against.
                </KeepInMind>
              </SubSection>
            </>
          ),
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
                  At the width this page works in, that is 16 numbers of which 4
                  are anything at all. The direction drawn for flour is non-zero
                  at positions 5, 7, 8 and 9 and zero at the other twelve. Draw
                  again with a different starting point and every one of those
                  numbers changes, and nothing about the collection has moved.
                </p>
                <DrawnDirections
                  words={["flour", "sugar", "bake", "anchor", "the"]}
                />
                <KeepInMind>
                  These directions are not the answer and they are not a small
                  version of it. They carry identity and nothing else, in the
                  way a name carries identity, so flour and sugar are as
                  unrelated here as flour and anchor and are meant to be. What
                  they are is the raw material a position gets summed out of.
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
                  Two words that keep the same company add up the same
                  directions and land near each other, and neither of them ever
                  needed a row of its own in anything. That is the whole of the
                  method, and the rest of this page is spent on why the sum does
                  not turn into a smear and on how far its answer falls from the
                  one the table of counts would have given.
                </p>
                <PositionBuildUp />
                <WorkedExample title="Cat, over three sentences">
                  <p>
                    Cat appears twice, in the cat sat and in the cat ran, and
                    with a window of two positions it has four neighbours in
                    all. Adding the direction of the gives 0, 0, 1, −1, −1, 0,
                    1, 0. Adding sat next cancels the −1 in the fifth position
                    and leaves 0, 0, 1, −1, 0, 1, 0, −1. The second sentence
                    contributes the again and then ran, and the total finishes
                    at 0, 1, 2, −3, 0, 0, 1, −1, which is exactly what the fit
                    reports as the position of cat. Four additions of eight
                    numbers each, and no table of any kind was written down.
                  </p>
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
                  It is worth pausing on what is absent. There is no objective
                  being minimised, so there is no learning rate and no question
                  of whether the walk has converged. There are no eigenvectors,
                  so no decomposition has to be run and nothing has to be
                  reordered by how much it accounts for. There is no second pass
                  over the collection.
                </p>
                <p>
                  The only randomness in the whole procedure is the draw of the
                  directions, and that happens before the first word is read.
                  Fix the draw and the answer is fixed, exactly, down to the
                  last bit, however many times it is run.
                </p>
                <p>
                  The work is easy to count. On the twenty-four documents there
                  are 144 word occurrences, and at a window of five positions
                  each side there are 720 occasions where one word is inside
                  another&rsquo;s window. Each of those adds a direction with 4
                  non-zero entries, so the whole reading is 2,880 updates to a
                  single number, and nothing else happens.
                </p>
                <InAModel>
                  The reason those numbers matter is what they do not depend on.
                  The work in one pass grows with how long the collection is and
                  with how many non-zero entries a direction carries, and not at
                  all with how large the vocabulary is or how wide the positions
                  are. Building the table instead grows with the square of the
                  vocabulary whatever the collection says.
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
                  twenty-four documents and let a neighbour further away count
                  less, so that a weight of a third appears, and the largest
                  disagreement becomes 8.88 × 10⁻¹⁶ in a table whose largest
                  entry is 11.25, which is rounding and not a difference of
                  method.
                </p>
                <KeepInMind>
                  Nothing forces anybody to take the second route, and in
                  practice nobody does. It matters because it is the statement
                  of what the first route computes, and because a claim about
                  random projections is a claim about a multiplication by a
                  random block, which is a thing the accumulating pass does not
                  look like until this is pointed out.
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
                  The reason it does not is a fact about high-dimensional space
                  that is hard to believe from low-dimensional experience. Two
                  directions drawn at random are nearly at right angles to each
                  other almost all of the time, and the more numbers they have
                  the more nearly. Being at a right angle is exactly the
                  condition for one to contribute nothing to a reading of the
                  other, so adding a great many of them together leaves each one
                  still recoverable, up to a little interference.
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
                  A pair at exactly a right angle here is a pair whose non-zero
                  entries do not share a single position, and that is what most
                  pairs are once a direction is four non-zero entries in a few
                  hundred slots. The rest of the interference is the pairs that
                  do share one.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The rule that predicts it, and where it stops predicting">
                <p>
                  The rule behind those numbers is short. Two directions with n
                  non-zero entries scattered over d positions share about n
                  squared over d positions on average. Each shared position
                  contributes plus or minus one to a reading whose natural size
                  is n, so the expected size of the overlap is about n over d.
                </p>
                <Equation>{"expected overlap ≈ n / d"}</Equation>
                <p>
                  At four non-zero entries in fifty positions that says 0.0800
                  and the measurement is 0.0744; at five hundred positions it
                  says 0.0080 and the measurement is 0.0077. Those are close
                  enough that the rule is worth carrying around.
                </p>
                <p>
                  It stops being worth carrying at both ends, and I would rather
                  report where than let it be quoted where it fails. At eight
                  positions it predicts 0.5000 and the measurement is 0.2994,
                  which is a ratio of 0.5988, so it overstates the interference
                  by nearly half at the narrow end. And if the directions are
                  allowed to fill up instead of staying sparse, it collapses
                  entirely. At fifty positions with all fifty filled it predicts
                  1.0000, meaning every pair should lie on top of every other,
                  and the measurement is 0.1162.
                </p>
                <PerpendicularityCurve />
                <p>
                  The reason for both failures is the same. The rule counts the
                  shared positions and then treats each one as contributing its
                  full weight, when in fact the sign of a shared position is a
                  coin toss and the shared positions cancel each other. Once
                  there are many of them the cancelling dominates, which is why
                  the measurement falls further and further below the prediction
                  as the directions fill.
                </p>
                <KeepInMind>
                  Use n over d where the directions are sparse relative to the
                  width and there are few enough shared positions for the
                  cancelling not to matter, which is the case every practical
                  choice belongs to. Outside that it is not a loose guide, it is
                  wrong by a factor of more than eight.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. If they were exactly perpendicular, nothing would be lost">
                <p>
                  It is worth being precise about what near-perpendicularity is
                  buying, because there is a clean statement available and it is
                  stronger than the usual hand-wave. Suppose for a moment the
                  drawn directions really were exactly at right angles to each
                  other and all of the same length. Then multiplying the table of
                  counts by them would be a rotation of the space the rows live
                  in, and a rotation changes no angle between any two rows at
                  all. Every question anybody wanted to ask of the table would
                  come back identical, and the narrowing would have cost
                  nothing at all.
                </p>
                <WhyThisWorks>
                  <p>
                    They are not exactly at right angles, and they cannot be,
                    since a space of d numbers holds at most d directions
                    mutually at right angles and there are usually more words
                    than that. What Johnson and Lindenstrauss proved in 1984 is
                    that this hardly matters. A random linear map into
                    d dimensions keeps every distance among a set of points to
                    within a factor of one plus or minus epsilon, provided d is
                    roughly the logarithm of how many points there are divided by
                    epsilon squared, and crucially that has nothing to do with
                    how many dimensions the points started in. Achlioptas showed
                    in 2001 that a sparse map with entries only −1, 0 and +1
                    satisfies the same bound as one drawn from a bell curve.
                  </p>
                  <p>
                    The claim is checkable here rather than only citable, and
                    the check produces a result I did not expect. At 2048
                    numbers a word, one draw happened to give all twenty-three
                    words non-zero entries that never once landed in the same
                    position, so the directions really were exactly at right
                    angles, and every angle in the table came through the
                    projection with a largest change of 3.8 × 10⁻¹⁷, which is
                    the rounding of the arithmetic and nothing else. At the same
                    width, another draw left two pairs sharing a position, and
                    the angles moved by 0.0109. Exactness is a property of the
                    draw rather than of the width.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  So the interference is entirely the pairs of directions that
                  happen to share a position, and everything else about the
                  method is exact. That is the sentence the last Part of this
                  page returns to, because a pair sharing a position is settled
                  before any text is read and no amount of text will unsettle
                  it.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. Sparse and ternary is a choice about cost, and it turns out to be free">
                <p>
                  Nothing so far said the directions had to be mostly zeros. The
                  original statements of this geometry drew every entry from a
                  bell curve, and that works. The reason for four non-zero
                  entries and nothing else is arithmetic in the inner loop.
                  Adding a direction with four non-zero entries touches four
                  numbers, and it touches four whatever the width is, so the
                  reading of the collection does not get more expensive when the
                  positions get wider. A dense direction touches every position,
                  so the same reading at 2048 numbers a word would cost five
                  hundred times what it costs at four.
                </p>
                <p>
                  The entries being only −1, 0 and +1 removes the multiplication
                  as well. Adding a direction becomes adding and subtracting
                  ones at a handful of addresses, with no floating-point
                  multiply anywhere in the reading.
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
                  caption="How far the angles between two subject words moved away from the whole table’s answer, averaged over twelve draws. Across a row the numbers barely move; down a column they fall by roughly a factor of five."
                />
                <p>
                  Reading across a row, the widest and narrowest settings differ
                  by 0.0056 at 16 numbers and by 0.0055 at 256, which is inside
                  the swing one draw makes. Reading down a column, the same
                  setting goes from 0.1714 to 0.0393 as the width grows. The
                  width is doing all the work, so two non-zero entries can be
                  chosen for the two slot updates they cost per neighbour
                  rather than defended as a compromise.
                </p>
                <KeepInMind>
                  A single draw does not show this and will mislead anybody who
                  looks at one. At 16 numbers, the draw the rest of this page
                  uses puts four non-zero entries ahead of two by 0.0610, and at
                  256 numbers the same draw puts two ahead of four by 0.0255.
                  The ordering there is settled by the draw, which is why the table
                  above is an average and says how many draws it averaged.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. What The Shortcut Costs",
          content: (
            <>
              <SubSection title="14. The neighbours are reordered rather than replaced">
                <p>
                  The honest way to price the shortcut is to build the table it
                  avoids, ask it the same questions, and report the difference.
                  Ask both which words are nearest to flour and the two answers
                  hold the same words in a different order. Five of the
                  fit&rsquo;s six nearest are among the table&rsquo;s six
                  nearest, and the two
                  disagree about which is first. The fit says eggs, which the
                  table ranks third; the table says bake, which the fit ranks
                  third.
                </p>
                <p>
                  That is the typical damage and it is mild. The sharper case is
                  a pair the two readings disagree about in kind rather than in
                  degree. Flour and anchor come out at 0.1208 in the table, a small
                  positive number saying the two have a little in common through
                  the words both halves share. In the fit they come out at −0.2437.
                  Nothing about the collection made anchor the opposite of
                  flour; the interference from a few directions that happened to
                  share positions did.
                </p>
                <KeepInMind>
                  A number near zero is where the interference does its worst
                  damage, because the signal that would have held the answer in
                  place is smallest exactly there. Flour and sugar, genuinely
                  alike, move from 0.6991 to 0.6270 under the same fit that sent
                  flour and anchor from 0.1208 to −0.2437, so the pair with
                  almost nothing in common moved five times as far.
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
                  Look at 529 on that axis. That is how wide the table
                  is on a side, so a fit at that width is not compressing
                  anything at all, and the gap is still 0.0181 rather than zero.
                  A random map is not the identity even when it has room to be,
                  and eight pairs of directions were still sharing a position at
                  that width.
                </InAModel>
              </SubSection>

              <SubSection title="16. Where a method that builds the table wins">
                <p>
                  There is a place where the shortcut is plainly worse than the
                  alternative, and it is not about the projection at all. It is
                  about what gets projected. The sum in Part 2 adds a
                  neighbour&rsquo;s direction once per occurrence, so a word that
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
                  The fit inherits the raw table&rsquo;s number almost exactly,
                  which is what a faithful projection of the raw table should do.
                  The method that builds the table has somewhere to put a repair
                  and this one does not, because there is no moment at which the
                  counts exist as counts to be reweighted. The usual answer is to
                  discard the frequent words before reading, or to let a
                  neighbour further away count less, and both are decisions taken
                  before the reading rather than corrections applied after it.
                </p>
                <KeepInMind>
                  Read that comparison as being about the weighting rather than
                  about the projection. Adding up random directions is a way of
                  getting a narrow answer out of a table of counts, and its
                  0.5064 against the table&rsquo;s own 0.5173 is the projection
                  reporting those counts faithfully. Any repair has to reach the
                  counting rule itself, before a single direction is added up.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. The work, counted honestly">
                <p>
                  It would be easy to leave the impression that the shortcut is
                  always the cheap route. On this collection it is not, and the
                  numbers say so.
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
                  Building the table needs 529 numbers to exist at once, and the
                  answer needs 368, so the saving in memory is a factor of 1.44
                  and not worth the trouble. What decides it is how each figure
                  grows. The 2,880 grows with how long the collection is and with
                  how many non-zero entries a direction carries, and stops there.
                  The 529 grows with the square of the vocabulary and the 8,464
                  grows with the square of the vocabulary times the width, and
                  neither depends on how much or how little text there was.
                </p>
                <InAModel>
                  So the scale at which this method is the right one is the scale
                  at which the square of the vocabulary is the problem, which is
                  every real collection and none of the ones on this page. The
                  measurements here are honest about a small case and the
                  argument is about the shape of the growth, which is exactly the
                  distinction the original proposal was making.
                </InAModel>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Where Random Indexing Stops Being Defined",
          content: (
            <>
              <SubSection title="18. Nearly perpendicular is not perpendicular, and more text does not help">
                <p>
                  Part 3 said the interference is exactly the pairs of directions
                  that share a position. That has a consequence worth stating on
                  its own, because it makes this error a different kind of thing
                  from most of the errors on this site.
                </p>
                <p>
                  Which pairs share a position is settled by the draw, before any
                  text is read. So the error it causes is not an error of
                  estimation and does not shrink as the evidence accumulates.
                  Write the same twenty-four documents out twice, and every count
                  doubles; the positions all double with them; and an angle
                  between two positions is unchanged by a common scale. Measured, the
                  gap against the whole table is 0.14412102749793634 with
                  the collection written once, and at 0.14412102749793634 with it
                  written eight times, and one pair of words comes out at
                  0.6270095706410385 in both, identical to the last bit.
                </p>
                <p>
                  Reading more text of course changes the counts, and better
                  counts do give better answers. What does not change is the
                  distortion the projection adds on top of whatever those counts
                  say. That is a fixed function of the draw and the width, and
                  the only two things that move it are drawing again and asking
                  for more numbers.
                </p>
                <KeepInMind>
                  So there is a floor, and only the width lowers it. Wanting the
                  angles within 0.05 of the table&rsquo;s own on this collection
                  means paying for 128 numbers a word before the reading starts,
                  since sixteen leaves 0.1441 there however much text is fed
                  through it.
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
                  A consequence follows for the coordinates themselves. In a
                  squeeze, the first coordinate means the strongest direction in
                  the collection and is comparable across two fits of the same
                  data. Here the fifth coordinate is the total of whichever words
                  happened to be handed a non-zero entry in position five, so it
                  means nothing on its own and nothing across two draws.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The answer depends on the draw">
                <p>
                  Two fits of one collection at one width, differing in nothing
                  but which positions the draw picked, are two different answers.
                  How different is a measurable quantity and it is larger than it
                  is comfortable to admit at the narrow end.
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
                  So a single number read off a single fit is a weaker claim than
                  it looks, and at a narrow width it is close to no claim at all.
                  An average over many pairs is far steadier than any of the
                  pairs in it, which is the difference between quoting a
                  particular pair of words and quoting how well the two halves
                  came apart.
                </KeepInMind>
              </SubSection>

              <SubSection title="21. The cases with nothing to compute">
                <p>
                  Several inputs leave this method with nothing to work out
                  rather than something approximate to work out, and a few more
                  leave it with a genuine choice whose cost is worth knowing. The
                  table gathers both, with what the mathematics says in each
                  case.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what the method says"
                  rows={[
                    {
                      expression: "a word with no company at all",
                      reason:
                        "its position is a sum over nothing, which is the origin rather than a small number. The origin has no direction, so the angle between it and anything else is a zero divided by a zero and is undefined; a ranking of what such a word resembles does not exist rather than being empty.",
                    },
                    {
                      expression: "two words whose company is identical",
                      reason:
                        "the same position exactly, whatever was drawn, since both sums are over the same collection of directions, and a sum is settled by what goes into it and by nothing else. That is correct rather than a failure, and it says the method can never tell such words apart, at any width and under any draw.",
                    },
                    {
                      expression: "positions only two numbers wide",
                      reason:
                        "defined, and useless. With two non-zero entries in two positions only two directions exist at all, +1 then −1 and −1 then +1, so every word is handed one of two and every pair of positions comes out at exactly +1 or exactly −1. The measured answer for the whole collection is exactly those two values and nothing between them.",
                    },
                    {
                      expression: "an odd number of non-zero entries",
                      reason:
                        "no draw satisfies it, since the construction asks for as many entries of +1 as of −1. There is a real choice attached, which is to allow the imbalance, and it costs the property that a direction sums to zero, so a long sum of directions would drift in one direction rather than staying centred.",
                    },
                    {
                      expression: "more non-zero entries than there are positions",
                      reason:
                        "undefined. The positions are drawn without repeating, so asking for eight distinct slots in a direction four numbers long names a set that is not there.",
                    },
                    {
                      expression: "how many numbers to give a word",
                      reason:
                        "a real choice with nothing inside the reading to settle it. Measured here, the gap against the whole table falls from 0.3959 at eight numbers to 0.0109 at two thousand and forty-eight, monotonically and without an elbow, so no quantity the fit produces turns over as the width passes a good value.",
                    },
                    {
                      expression: "which draw was used",
                      reason:
                        "part of the answer rather than a detail of it. Two fits differing in nothing else gave one pair of words 0.0189 and 0.9646 at eight numbers a word, and spreads of 0.4032, 0.2853 and 0.1182 at sixteen, fifty and two hundred over twenty draws.",
                    },
                    {
                      expression: "the value of a single coordinate",
                      reason:
                        "means nothing on its own and nothing across two draws. Position five of a word’s answer is the total of whichever words happened to be handed a non-zero entry in that slot, and a redraw hands them elsewhere. An angle between two words survives a redraw approximately; a coordinate does not survive it at all.",
                    },
                    {
                      expression: "a pair of directions at exactly a right angle",
                      reason:
                        "that pair’s contribution is preserved exactly, and a draw in which no two directions share a position preserves every angle exactly. Measured at two thousand and forty-eight numbers, such a draw reproduced the whole table’s angles with a largest change of 3.8 × 10⁻¹⁷, and another draw at the same width, with two pairs sharing, moved them by 0.0109.",
                    },
                    {
                      expression: "more text",
                      reason:
                        "changes the counts and does not touch the distortion. Which directions share a position is settled before any reading, and an angle is unmoved by a scale, so writing the collection out eight times leaves the gap at 0.14412102749793634 exactly as one copy did.",
                    },
                    {
                      expression: "a word too rare to be given a position",
                      reason:
                        "a choice about the sentence it sat in rather than about the word. Dropping it makes the words on either side of it neighbours, which is what the published implementations do; leaving a gap instead makes the window’s reach depend on how many rare words happened to fall inside it. Neither is obviously right and the two give different counts.",
                    },
                    {
                      expression: "which of two words stood first",
                      reason:
                        "outside what is represented. A position is a sum, and addition does not remember an order, so a sentence and its reverse produce the same positions for every word in it.",
                    },
                    {
                      expression: "which sense of a word is meant",
                      reason:
                        "outside what is represented. One direction per spelling, so a word used for two unrelated things adds both sets of company into one position and settles between them, and there is no second position for the second sense to occupy.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of those lines carry most of the weight in practice. The
                  distortion is fixed by the draw rather than estimated from the
                  text, so more text will not reduce it and only more numbers a
                  word will; and the width has to be chosen before the reading
                  with nothing produced during the reading to say whether the
                  choice was right.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
