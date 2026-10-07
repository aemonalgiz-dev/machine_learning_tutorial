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
import { CodebookExplorer } from "@/components/widgets/CodebookExplorer";
import { DistortionCurveChart } from "@/components/widgets/DistortionCurveChart";
import { NearDisagreementTable } from "@/components/widgets/NearDisagreementTable";
import { NearestEntryTable } from "@/components/widgets/NearestEntryTable";
import { SameNumberTable } from "@/components/widgets/SameNumberTable";
import { UnusedEntriesTable } from "@/components/widgets/UnusedEntriesTable";

export const metadata: Metadata = {
  title: "Codebook Quantisation · oop_ml",
  description:
    "Assign each vector to a nearby codebook entry and measure the reconstruction error.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function CodebookQuantisationPage() {
  return (
    <ConceptPage
      lessonId="codebook-quantisation"
      intuition={lessonIntuitions["codebook-quantisation"]}
      technicalStart="Part 2. A Table of Positions, and the Nearest One Wins"
      openingTitle="Replace Many Possible Vectors with a Small Set of Representatives"
      playgroundIntro="Compare an input vector with its selected codebook entry and reconstruction. Increase the codebook size and inspect both the error and the number of entries used."
      title="Codebook Quantisation"
      tagline="Assign each vector to a nearby codebook entry and measure the reconstruction error."
      prerequisites={
        <>
          The contract a vocabulary has to keep is set out on the{" "}
          <Link href="/concepts/what-a-token-is" className={link}>
            what a token is
          </Link>{" "}
          page, and this page is that same contract asked of something that was
          never writing. The table of representative vectors is chosen by the
          method on the{" "}
          <Link href="/concepts/k-means" className={link}>
            k-means
          </Link>{" "}
          page, so that page is worth having read, and the notion of near that
          both of them use is one of the six on the{" "}
          <Link href="/concepts/distance-metrics" className={link}>
            distance metrics
          </Link>{" "}
          page.
        </>
      }

      playground={<CodebookExplorer />}
      sections={[
        {
          title: "Part 1. A Picture Is Already Numbers",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Why this page changes the example">
                <p>
                  Every other page in this section carries one sentence,{" "}
                  <em>Dr. Alvarez didn&rsquo;t expect the low-cost
                  re-analysis.</em> It is there because it breaks things, and
                  none of the things it breaks are things this method can meet.
                  The method here is vector quantisation, and it reads vectors
                  rather than writing, so a sentence
                  would have to be turned into vectors before it arrived, and
                  every interesting decision would then have been taken by
                  whatever did the turning. So this page carries a picture
                  instead, and says so plainly rather than pretending the
                  sentence still fits.
                </p>
                <p>
                  The picture is sixteen pixels down and sixteen across, each
                  pixel a brightness between 0 and 1. That is 256 numbers, and
                  we will cut them into 128 pieces of two, each piece being a
                  pixel and the pixel to its right. Two numbers per piece is a
                  small piece by the standards of anything that codes real
                  images, where sixteen or sixty-four is ordinary, and it is
                  chosen here because a piece of two numbers is a point in the
                  plane and can therefore be drawn on a page and checked with a
                  pencil.
                </p>
                <KeepInMind>
                  The running example on this page is a picture, cut into pairs
                  of side-by-side pixels. The shared sentence returns on the
                  pages either side of this one.
                </KeepInMind>
              </SubSection>

              <SubSection title="2. The four pictures, and what each is for">
                <p>
                  Four pictures run through the whole page, and they are not four illustrations of one thing. Each one makes the same measurement come out differently, and the differences are where most of the argument lives. The photograph is smooth, so a pixel and the pixel beside it are nearly equal almost everywhere. The poster is four flat bands of tone.
                </p>
                <p>
                  The printed chart is hard-edged stripes. The speckled square has every pixel drawn independently of every other, which is the case with no structure in it at all and is the control the other three are measured against.
                </p>
                <NumberTable
                  headings={[
                    "picture",
                    "pieces",
                    "different pieces",
                    "what it is there to show",
                  ]}
                  rows={[
                    ["photograph", "128", "53", "the ordinary case, where neighbouring pixels agree"],
                    ["poster", "128", "93", "content with a natural number of parts"],
                    ["printed chart", "128", "5", "very little variety, and hard edges"],
                    ["speckled square", "128", "127", "no structure, as a control"],
                  ]}
                  caption="Every picture has the same 128 pieces; what differs is how many of them are different from each other."
                />
                <p>
                  The playground above quantises any of the four at any table
                  size. It is worth turning the table size down to 2 on the
                  photograph and watching the reconstruction beside it, before
                  reading any of the arithmetic below.
                </p>
                <KeepInMind>
                  The photograph is the running example. The other three are
                  there because a single picture cannot show what the method
                  does and does not exploit.
                </KeepInMind>
              </SubSection>

              <SubSection title="3. The contract, asked of something that was never text">
                <p>
                  A model reads whole numbers and nothing else, and that is as
                  true of a model reading a picture as of one reading a
                  sentence. The{" "}
                  <Link href="/concepts/what-a-token-is" className={link}>
                    vocabulary page
                  </Link>{" "}
                  sets out what has to be settled
                  before a stream of numbers means anything, which is what the
                  pieces are, how they are found, what happens at a piece the
                  table has never seen, and whether the round trip is exact.
                  Those four questions do not stop applying when the pieces
                  stop being writing.
                </p>
                <p>
                  What changes is the answer to the last of them. A character
                  vocabulary that has met every character in a text reproduces
                  that text exactly, so the round trip loses nothing and the
                  fourth question has a clean yes. Here the answer is no, always,
                  and the interesting part is that it is a number rather than a
                  yes or a no, which is what the middle of this page measures.
                </p>
                <KeepInMind>
                  The same four questions, and only the fourth answers
                  differently. A vocabulary of vectors cannot promise an exact
                  round trip, so it has to report how far off it was instead.
                </KeepInMind>
              </SubSection>

              <SubSection title="4. Why the brightnesses cannot be the vocabulary">
                <p>
                  The obvious thing to try first is to skip the vocabulary
                  altogether and let the pieces be their own numbers. It fails
                  for a reason that has nothing to do with this picture. A
                  vocabulary is a finite list, and every number in it names one
                  entry, so a scheme that hands the pieces over as they are is
                  claiming there is a finite list of pieces to name. A
                  brightness is a real number, so there is no such list.
                </p>
                <>
                  <p>
                    Rounding brightness to two decimal places still leaves 101 possible
                    values per pixel. A two-pixel piece can combine any of them.
                  </p>
                  <Equation>{"possible two-pixel pieces = 101 × 101 = 10,201"}</Equation>
                  <p>
                    The photograph uses only fifty-three of those possibilities.
                    Enumerating every possible piece spends most of the table on
                    combinations absent from this picture.
                  </p>
                </>
                <WhyThisWorks title="Why the count grows with the coordinates too">
                  <>
                    <p>
                      The number of possible pieces grows exponentially with the number
                      of pixels per piece.
                    </p>
                    <Equation>{"two pixels:     101² = 10,201 possibilities\nsixteen pixels: 101¹⁶ ≈ 1.17 × 10³² possibilities"}</Equation>
                    <p>
                      A useful codebook therefore records representative pieces from the
                      data instead of trying to list every possible combination.
                    </p>
                  </>
                </WhyThisWorks>
                <KeepInMind>
                  There is no finite list of brightness pairs to write down, and
                  rounding to a grid replaces the infinite list with an
                  enormous one whose size is set by the sensor rather than by
                  the picture. What is needed is a short list chosen to suit
                  what actually occurs.
                </KeepInMind>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. A Table of Positions, and the Nearest One Wins",
          content: (
            <>
              <SubSection title="5. The rule, in one line">
                <p>
                  Keep a fixed list of vectors. Each one owns the number that is
                  its position in the list, counting from zero. To give a new
                  vector a number, measure how far it is from every entry and
                  answer with the position of the nearest. That is the whole
                  method, and everything else on this page is a consequence of
                  it or a cost of it.
                </p>
                <Equation>
                  {"number of v  =  the position i minimising  ||v − entryᵢ||²"}
                </Equation>
                <p>
                  The square is there for convenience rather than for meaning.
                  Squaring is increasing on non-negative numbers, so the entry
                  that minimises the squared distance is the entry that
                  minimises the distance, and the square saves a square root
                  that would change no answer.
                </p>
                <KeepInMind>
                  A table of vectors, and the position of whichever is nearest.
                  The table is called a codebook and its entries are called
                  codes, which is where the second name for the method comes
                  from, and vector quantisation and codebook quantisation are
                  the same thing.
                </KeepInMind>
              </SubSection>

              <SubSection title="6. Four vectors against three entries">
                <p>
                  Before any picture, the smallest instance that shows every
                  part of the rule. Three entries in the plane, at (0, 0),
                  (4, 0) and (0, 3), owning the numbers 0, 1 and 2. Four vectors
                  to quantise, at (1, 0), (3, 1), (1, 2) and (2, 0). The table
                  below is every squared distance, with the winner in each row
                  marked, and it is small enough that a reader can check any
                  cell of it.
                </p>
                <NearestEntryTable showTie={false} />
                <WorkedExample title="One row, by hand">
                  <>
                    <p>
                      Compare the vector (3, 1) with each of the three codebook entries.
                      Squared Euclidean distance is enough to rank them.
                    </p>
                    <Equation>{"entry 0 at (0, 0): 3² + 1² = 10\nentry 1 at (4, 0): (−1)² + 1² = 2\nentry 2 at (0, 3): 3² + (−2)² = 13"}</Equation>
                    <p>
                      Entry 1 is nearest. Encoding stores the ID one; decoding returns
                      its representative vector, (4, 0).
                    </p>
                  </>
                </WorkedExample>
                <KeepInMind>
                  The four vectors become 0, 1, 2 and 0. Two different vectors
                  have already received the same number, at the fourth row, and
                  that is what a finite table does rather than an accident of
                  these four.
                </KeepInMind>
              </SubSection>

              <SubSection title="7. The tie, and the rule that settles it">
                <p>
                  The last of the four vectors, (2, 0), is 4 away in squared
                  distance from entry 0 and 4 away from entry 1. Nothing in the
                  rule says which of them it should get, because the rule says
                  nearest and there are two of those. Something has to decide,
                  and whatever decides is arbitrary in the strict sense that a
                  different choice would be equally correct.
                </p>
                <p>
                  The convention taken here is the lower position, which means
                  the entry that comes first in the table rather than the entry
                  that is smaller as a vector. That distinction is not idle.
                  Writing the same three entries down in a different order, with
                  (4, 0) first, sends the tied vector to the other one, and
                  every other answer and the total cost stay exactly where they
                  were.
                </p>
                <NearestEntryTable />
                <KeepInMind>
                  A tie has no right answer, so it has a stated one. The
                  convention here is the earlier position in the table, and a
                  reader comparing two implementations of this method should
                  expect them to disagree on ties unless both have written the
                  rule down.
                </KeepInMind>
              </SubSection>

              <SubSection title="8. This table has been met before, under another name">
                <p>
                  A short list of positions, each standing for whatever is
                  nearest to it, chosen so that the things nearest to it are
                  close to it. That is the description of a codebook, and it is
                  also, word for word, the description of the centres the{" "}
                  <Link href="/concepts/k-means" className={link}>
                    k-means
                  </Link>{" "}
                  page finds. The two are the same object. Cluster k becomes
                  entry k, the assign step of k-means is exactly the lookup
                  described in section 5, and the quantity k-means calls inertia
                  is the total this page is about to call the rounding error,
                  before it is divided by the number of pieces.
                </p>
                <p>
                  Naming that connection is not a nicety. It settles where the
                  table comes from, which is Part 6, and it settles what the
                  table is good at, which is being close to whatever it was
                  chosen from and nothing else. Every warning the clustering
                  page gives about a grouping being a property of the rows it
                  was fitted on transfers here without a word changed, and lands
                  harder, because a grouping is usually inspected by somebody
                  before it is used, while a table of codes is read straight
                  into a model with no way of reporting a poor match.
                </p>
                <InAModel>
                  <p>
                    The speech units a model like HuBERT reads are made this
                    way. Frames of speech features are grouped by k-means, the
                    centres become the table, and a frame&rsquo;s unit is the
                    number of the centre nearest to it. There is no separate
                    machinery; the clustering is the vocabulary.
                  </p>
                </InAModel>
                <KeepInMind>
                  A codebook is a set of cluster centres wearing a different
                  word, and a lookup against it is the assign step of k-means
                  run on one row.
                </KeepInMind>
              </SubSection>

              <SubSection title="9. Reading the numbers back again">
                <p>
                  Going the other way is a lookup and nothing more. Number 1
                  means the vector sitting at position 1 of the table, so a run
                  of numbers becomes a run of vectors by reading them off, and
                  the picture is reassembled by putting those vectors back where
                  their pieces came from. A number outside the table has no
                  meaning at all, exactly as a number past the end of a word
                  list does, and there is nothing to give back for it.
                </p>
                <p>
                  What comes back is the entry, not the piece. That sentence is
                  short and is the whole of the next Part, because it is the
                  point at which this method parts company with a vocabulary of
                  characters, where what comes back is the character that went
                  in.
                </p>
                <KeepInMind>
                  Encoding is a search over the table, decoding is an index into
                  it. Only one of the two can lose anything, and it is the
                  first.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. The Round Trip Is Lossy, and the Loss Is a Number",
          content: (
            <>
              <SubSection title="10. What a piece loses on the way through">
                <p>
                  Send a piece through and back. The piece (0.35, 0.39) of the
                  photograph, under a table of four entries, becomes the number
                  0, and the number 0 means the vector (0.4490, 0.5119). The
                  piece did not survive. What survives is the entry it was
                  nearest to, and the difference between the two is gone in the
                  sense that nothing downstream holds it.
                </p>
                <p>
                  That is not a defect to be repaired by a better
                  implementation. A table of four entries can distinguish four
                  things, and the photograph has 53 different pieces, so at
                  least 49 of them have to arrive somewhere they did not start.
                  What is worth asking is how much is lost rather than whether
                  anything is, and the answer to that is a number.
                </p>
                <KeepInMind>
                  A round trip through a codebook returns the nearest entry,
                  never the input. Any scheme with fewer entries than the data
                  has different values is lossy by counting alone.
                </KeepInMind>
              </SubSection>

              <SubSection title="11. The rounding error, defined">
                <p>
                  Take each piece, subtract the entry it became, square the
                  result coordinate by coordinate, add those up, and average
                  over the pieces. That average is the rounding error of the
                  whole collection under that table, and it is what a coder
                  calls the distortion.
                </p>
                <Equation>
                  {"error  =  (1 / n) × Σᵢ ||pieceᵢ − entry(pieceᵢ)||²"}
                </Equation>
                <p>
                  On the four vectors of section 6 the squared gaps are 1, 2, 2
                  and 4, so the error is their mean, 2.25. Every number this
                  page quotes for a picture is that same average, and because it
                  is a mean of squares its units are the square of a brightness,
                  which is awkward to read. Taking the square root of the error
                  divided by the two coordinates gives a figure in brightness
                  again, and that is the typical miss on a single pixel.
                </p>
                <WhyThisWorks title="Why this is the quantity, rather than some other measure of miss">
                  <p>
                    The choice of squares is not neutral, and it is the same choice the update rule makes. The point minimising the total squared distance to a set of points is their mean, which is why the step that moves an entry to the mean of the pieces that chose it is the step that lowers this number.
                  </p>
                  <p>
                    Measure the miss some other way, by the sum of the coordinate gaps for instance, and the minimising point is no longer the mean and the procedure that chooses the table is no longer guaranteed to improve. The measure of loss and the way the table is chosen are one decision taken twice.
                  </p>
                </WhyThisWorks>
                <KeepInMind>
                  The rounding error is the mean squared distance from a piece
                  to the entry it became. It is k-means&rsquo; inertia divided by
                  the number of rows, and the same choice of squares underlies
                  both.
                </KeepInMind>
              </SubSection>

              <SubSection title="12. The photograph at sixteen entries">
                <p>
                  Now the measurement. The photograph&rsquo;s 128 pieces against
                  a table of sixteen entries chosen from those same pieces give
                  a rounding error of 0.000418, which is a typical miss of
                  0.0145 on a pixel whose brightness runs from 0 to 1. The
                  furthest any piece had to travel is a squared gap of 0.00243,
                  which is 0.0493 in the plane. Every one of the sixteen entries
                  wins at least one piece.
                </p>
                <CodebookExplorer initialPicture="photograph" initialCodes={16} />
                <p>
                  Turn the table size down and watch two things at once. The
                  points in the plane are the pieces and the marked positions
                  are the entries, and at two entries the picture visibly
                  becomes two tones while the error goes up by a factor of
                  nearly sixty. The pieces lie in a narrow band along the
                  diagonal, because a pixel and its neighbour are nearly equal
                  in a smooth picture, and that band is what makes a small table
                  do as well as it does here.
                </p>
                <KeepInMind>
                  Sixteen entries hold the photograph to within about a hundredth
                  of a brightness per pixel. The number to carry is 0.000418,
                  since the rest of the page is measured against it.
                </KeepInMind>
              </SubSection>

              <SubSection title="13. What the numbers cost to write down">
                <p>
                  A table of sixteen entries owns the numbers 0 to 15, so each
                  number takes four bits, and the whole picture becomes 128
                  numbers of four bits, which is 512 bits. The original was 256
                  brightnesses. Whether that is a saving depends entirely on what
                  a brightness was costing, and at any ordinary precision it is a
                  large one.
                </p>
                <>
                  <p>
                    The codebook must travel with the IDs, or the receiver cannot
                    reconstruct their meaning. This example uses sixteen entries with
                    two coordinates each.
                  </p>
                  <Equation>{"codebook = 16 × 2 = 32 brightness values\nencoded picture = 128 IDs + 32 codebook values\noriginal picture = 256 brightness values"}</Equation>
                  <p>
                    These are counts of stored values, not equal-sized bytes: an ID and
                    a brightness value may use different representations. Sharing the
                    same table across many pictures amortizes the codebook cost.
                  </p>
                </>
                <NumberTable
                  headings={[
                    "entries",
                    "bits per number",
                    "bits for the picture",
                    "numbers in the table",
                    "rounding error",
                  ]}
                  rows={[
                    ["1", "0", "0", "2", "0.113862"],
                    ["2", "1", "128", "4", "0.024903"],
                    ["4", "2", "256", "8", "0.007695"],
                    ["8", "3", "384", "16", "0.001877"],
                    ["16", "4", "512", "32", "0.000418"],
                    ["32", "5", "640", "64", "0.000053"],
                  ]}
                  caption="The photograph, at every table size the page uses. A table of one entry costs no bits at all, because there was never anything to say."
                />
                <KeepInMind>
                  What everything downstream pays is bits per piece, which is
                  the logarithm of the table size, so doubling the table costs
                  exactly one more bit on every piece. The table itself is a
                  fixed cost that only a large collection amortises.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 to 3",
          quiz: [
            trueFalse(
              "Rounding every brightness to two decimal places does make the list of possible pieces finite, and the objection to enumerating it is that it is the wrong list rather than an endless one.",
              true,
              "Two decimal places leave 101 values per pixel and so 10,201 possible two-pixel pieces, which is finite. The photograph uses fifty-three of them, so enumerating the grid spends almost the whole table on combinations this picture never produces, and the size of that grid is set by the sensor rather than by the picture. At sixteen pixels a piece the same grid runs to about 1.17 × 10³² possibilities.",
            ),
            choice(
              "The vector (2, 0) sits 4 away in squared distance from entry 0 at (0, 0) and 4 away from entry 1 at (4, 0). What settles the number it gets?",
              [
                "The entry that is smaller as a vector",
                "The entry that comes first in the table",
                "Whichever entry has won fewer vectors so far",
                "Nothing, and the lookup refuses a tie",
              ],
              1,
              "The rule says nearest and there are two of those, so a convention has to decide, and the one taken here is the earlier position in the table. Writing the same three entries down with (4, 0) first sends the tied vector to the other entry while every other answer and the total cost stay where they were. Two implementations should be expected to disagree on ties unless both have written the rule down.",
            ),
            choice(
              "The photograph’s 128 pieces against a table of sixteen entries give 0.000418. What is that number?",
              [
                "The largest squared gap any single piece had to travel",
                "The mean squared distance from a piece to the entry it became",
                "The share of pieces that came back unchanged",
                "The squared gaps summed over all 128 pieces",
              ],
              1,
              "The rounding error takes each piece, subtracts the entry it became, squares coordinate by coordinate, and averages over the pieces. The furthest any piece travelled is a separate figure, a squared gap of 0.00243, and the typical miss read back in brightness is 0.0145.",
            ),
            several(
              "Which of these hold of the relationship between a codebook and the centres k-means finds?",
              [
                "Cluster k becomes entry k, and a lookup is the assign step run on one row",
                "Inertia is the rounding error before it is divided by the number of pieces",
                "The two are an analogy, since a codebook is fitted by a different procedure",
                "The warning that a grouping belongs to the rows it was fitted on transfers unchanged",
              ],
              [0, 1, 3],
              "They are the same object rather than two things that resemble each other, which is why the speech units a model like HuBERT reads need no separate machinery. The warning transfers and lands harder here, because a grouping is usually inspected by somebody before it is used while a table of codes is read straight into a model with no way of reporting a poor match.",
            ),
        ],
        },
        {
          title: "Part 4. What a Bigger Table Buys",
          content: (
            <>
              <SubSection title="14. The sweep, on all four pictures">
                <p>
                  One more bit per piece for every doubling of the table, and in
                  exchange the rounding error falls. How far it falls is the
                  trade, and it is not the same trade on every picture. The
                  chart below draws the error against the table size on a
                  logarithmic scale, where a constant factor per doubling is a
                  straight line, and beside it lists the factor at each step.
                </p>
                <DistortionCurveChart />
                <p>
                  The photograph&rsquo;s error falls by 4.57, then 3.24, then
                  4.10, then 4.49, then 7.96. The speckled square&rsquo;s falls
                  by 1.74, then 2.52, then 2.22, then 2.30, then 2.63. The two
                  are the same method on the same number of pieces at the same
                  table sizes, and one of them is getting roughly twice as much
                  for its bit as the other.
                </p>
                <KeepInMind>
                  A doubled table always costs one more bit per piece and does
                  not always buy the same reduction. What it buys depends on
                  the collection, which is the next section.
                </KeepInMind>
              </SubSection>

              <SubSection title="15. What the textbook predicts, and what was measured">
                <p>
                  There is a standard result for how this trade should behave when the table is large. For a collection filling d coordinates, the best achievable error falls roughly as the table size raised to the power of minus two over d, so with two coordinates a doubling should buy a factor of two, and with one coordinate it should buy a factor of four.
                </p>
                <p>
                  The speckled square is the case that result describes, since every pixel there was drawn independently and the pieces genuinely fill the square, and its measured factors of 1.74 to 2.63 sit around the predicted two.
                </p>
                <p>The two coordinates in these photograph patches are strongly related: neighboring pixels usually have similar brightness. The patches therefore cluster near the line where the coordinates are equal.</p>
<p>The measured spread along that line is 163.6 times the perpendicular spread. Although each patch is written with two coordinates, most observed variation lies close to one direction. This helps explain why its error reduction differs from a uniformly occupied two-dimensional example.</p>
<p>The measured reduction factors are 4.57, 3.24, 4.10, 4.49, and 7.96. Several are close to the idealized one-dimensional factor of four. The last occurs when the codebook is approaching the number of distinct patches in this small photograph, where a large-sample scaling argument is no longer a reliable description.</p>
<p>The comparison supports a useful distinction: the number of coordinates and the effective dimension occupied by the data need not be the same. It does not turn the idealized rate into an exact prediction for every finite codebook.</p>
                <NumberTable
                  headings={[
                    "picture",
                    "spread along over spread across",
                    "measured factor per doubling",
                    "factor predicted for that many dimensions",
                  ]}
                  rows={[
                    ["speckled square", "1.4", "1.74 to 2.63", "2, for two dimensions"],
                    ["printed chart", "2.9", "2.07 then 7.21", "2, for two dimensions"],
                    ["photograph", "163.6", "3.24 to 7.96", "4, for one dimension"],
                    ["poster", "642.7", "69.81 at four, then 1.76 to 2.33", "4, for one dimension"],
                  ]}
                  caption="The ratio of the two spreads is how flat the collection of pieces is. Nothing about the method changes across these rows; only the pieces do. The two outsized factors have different causes. The poster’s 69.81 arrives at the table size its four tones ask for, which is section 16, and the printed chart’s 7.21 arrives one step before its five different pieces are all held, which is section 17."
                />
                <KeepInMind>
                  A doubled table buys about a factor of two when the pieces
                  fill their coordinates and about a factor of four when they lie
                  along a line. This method is paid for by structure in the
                  data, and on data with none it earns the textbook rate and no
                  more.
                </KeepInMind>
              </SubSection>

              <SubSection title="16. Where the content decides the size">
                <p>
                  The poster is four flat bands of tone with a faint grain over
                  them, and its sweep does something neither of the others does.
                  Going from two entries to four cuts the error by 69.81, which
                  is far outside anything the smooth curve of the photograph
                  reaches. Going from four to eight cuts it by 1.76, which is
                  worse than the speckled square manages at the same step.
                </p>
                <p>
                  The explanation is not subtle and is worth saying anyway. The
                  poster has four tones, so the fourth entry is the one that
                  finishes the job, and every entry after that is spent on the
                  grain. When a collection genuinely has a number of parts, the
                  curve has a corner at that number, and that corner is a fact
                  about the picture rather than about the
                  method. When it does not, as with the photograph and the
                  speckled square, the curve is smooth and no table size is
                  distinguished.
                </p>
                <KeepInMind>
                  A sharp change in the curve’s slope marks the number of parts the
                  collection has. A smooth curve means there is no natural
                  answer there, and the table size is then a budget rather than
                  a discovery.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Where the curve stops">
                <p>
                  The curve cannot go on forever, and where it stops is decided by the collection rather than by the method. The photograph has 53 different pieces, so a table of 53 entries can hold one of each and reproduce it exactly, and the rounding error at that size comes out at 4.6 × 10⁻³³, which is zero to every bit the arithmetic keeps.
                </p>
                <p>
                  Asking for 54 is asking for an entry that has nothing of its own to be, and the result is two entries at one point, which is two numbers meaning one thing.
                </p>
                <p>
                  The printed chart reaches that wall much sooner, because it has
                  only five different pieces. Eight entries already reproduce it
                  exactly, and three of the eight win nothing at all. Sixteen
                  cannot be built. The chart is the useful case here precisely
                  because it is extreme, since the same thing is happening on the
                  photograph at 54 and is simply further away.
                </p>
                <KeepInMind>
                  The largest table a collection admits is the number of
                  different vectors in it. Beyond that the method stops being defined
                  rather than degrading, and Part 7 says why.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. Two Pieces, One Number",
          content: (
            <>
              <SubSection title="18. Pieces that share a number">
                <p>
                  Fewer entries than different pieces means some pieces share a
                  number, and the interesting question is how different two
                  pieces sharing a number can be. On the photograph at two
                  entries, the pieces (0.00, 0.00) and (0.41, 0.45) both become
                  the number 0, and both come back as (0.2067, 0.2366). Those
                  two pieces are 0.6088 apart in the plane, one of them being
                  black and the other being close to mid grey.
                </p>
                <SameNumberTable panel="collisions" />
                <p>
                  The widest such pair narrows as the table grows, from 0.6088
                  at two entries to 0.0894 at sixteen, which is the same trade
                  the previous Part measured seen from a different side. It never
                  reaches zero while there are fewer entries than different
                  pieces, and at every size there is some pair the numbers
                  cannot tell apart.
                </p>
                <KeepInMind>
                  Two genuinely different pieces receiving one number is the
                  ordinary working of the method rather than an edge case, and
                  the table size is what sets how different they may be.
                </KeepInMind>
              </SubSection>

              <SubSection title="19. A picture the table was never chosen for">
                <p>
                  Everything so far has quantised a picture against a table
                  chosen from that same picture. Take the photograph&rsquo;s
                  table of sixteen entries and put the printed chart to it
                  instead. The rounding error goes from 0.000418 to 0.104290,
                  which is 249.5 times worse, and 11 of the 16 entries are never
                  asked for at all.
                </p>
                <SameNumberTable panel="elsewhere" />
                <p>
                  The reason is visible in the plane. The photograph&rsquo;s
                  entries all lie in the narrow band near the diagonal, since
                  that is where its pieces were, and the chart&rsquo;s pieces
                  include (0.90, 0.05), a bright pixel next to a dark one, which
                  is a place no entry has any reason to be. That piece is given
                  the number 13, and 13 means the vector (0.4286, 0.4771), which
                  is mid grey twice over. A hard edge has become a flat patch.
                </p>
                <InAModel>
                  <p>
                    This is where the method is worse than the obvious alternative, and it is worth saying rather than burying. A fixed grid of levels, where each coordinate is rounded to one of a few evenly spaced values, covers the whole square whatever arrives and needs nothing fitted; it would round (0.90, 0.05) to something near (0.90, 0.05).
                  </p>
                  <p>
                    It pays for that by spending entries on regions no picture ever visits, which is why the fitted table wins by 249.5 times on the picture it was fitted for. A fixed grid would have kept that edge and would have spent some of its levels on brightness pairs this photograph never produces, where the fitted table put all sixteen of its entries inside the band its own pieces occupy.
                  </p>
                </InAModel>
                <KeepInMind>
                  A codebook is a property of the collection it was chosen from.
                  Put to something else it still answers, and it answers badly,
                  and the badness is concentrated exactly where the new
                  collection differs.
                </KeepInMind>
              </SubSection>

              <SubSection title="20. The number carries no notion of how near it was">
                <p>
                  Look at the two rows of the previous table together. The
                  chart&rsquo;s piece (0.05, 0.05) lands on entry 11 at a squared
                  gap of 0.001, which is as good a match as anything on the
                  photograph gets. Its piece (0.90, 0.05) lands on entry 13 at a
                  squared gap of 0.404696, four hundred times as large. What is
                  sent downstream in the two cases is the number 11 and the
                  number 13, and nothing else.
                </p>
                <p>
                  A model reading those numbers has no way to tell the excellent match from the hopeless one, because the output alphabet is whole numbers and a whole number is all it gets. That is the same fact the vocabulary page ends on, that a token number says which entry and nothing more, and it is sharper here, since the entries do have positions in a space and it is tempting to believe some of that survives.
                </p>
                <p>
                  It does not. Carrying the gap alongside the number is possible and is a different scheme, one that is no longer sending whole numbers.
                </p>
                <KeepInMind>
                  The answer is a number on its own, with no distance attached
                  to it. An exact
                  match and a poor one are indistinguishable to everything after
                  the lookup, which is why the rounding error has to be measured
                  by whoever chose the table and cannot be noticed later.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 4 and 5",
          quiz: [
            choice(
              "The speckled square’s error falls by factors of 1.74 to 2.63 per doubling and the photograph’s by 4.57 to 7.96. What accounts for the gap?",
              [
                "The speckled square is quantised in fewer pieces, so each doubling has less to work with",
                "The photograph's pieces lie close to one line, so they occupy fewer coordinates than they are written with",
                "The photograph's tables were fitted from more starting draws",
                "The speckled square is noisier, so its error cannot be measured as precisely",
              ],
              1,
              "The standard result has the best achievable error falling as the table size to the power minus two over the number of coordinates filled, so two coordinates predict a factor of two per doubling and one coordinate predicts four. The speckled square genuinely fills its square and measures around two. The photograph’s spread along the diagonal is 163.6 times its perpendicular spread, and several of its measured factors sit near four. Both pictures are the same 128 pieces at the same table sizes, so the count of pieces cannot be the cause.",
            ),
            trueFalse(
              "A sharp corner in the error curve marks the number of parts the collection has, and is a fact about the picture rather than about the method.",
              true,
              "The poster’s error falls by 69.81 from two entries to four and then by only 1.76 from four to eight, because the poster has four tones and the fourth entry is the one that finishes the job. Nothing about the method changed between the poster and the photograph, and the photograph and the speckled square give smooth curves, where no table size is distinguished and the size is a budget rather than a discovery.",
            ),
            trueFalse(
              "Asking for more entries than the collection has different pieces gives a table that degrades gracefully.",
              false,
              "The photograph has 53 different pieces, and at 53 entries the error comes out at 4.6 × 10⁻³³, which is zero to every bit the arithmetic keeps. Asking for 54 is asking for an entry with nothing of its own to be, and the result is two entries at one point, which is two numbers meaning one thing. The printed chart hits the same wall at eight entries, where three of them already win nothing.",
            ),
            choice(
              "The photograph’s table of sixteen entries is put to the printed chart instead. What happens?",
              [
                "The error rises to 0.104290 and 11 of the 16 entries are never asked for",
                "The lookup refuses, because the chart's pieces fall outside the table",
                "The error rises a little, since both are pictures of the same size",
                "The chart's hard edges survive, because an unmatched piece keeps its own value",
              ],
              0,
              "That is 249.5 times worse than the 0.000418 the table manages on the picture it was chosen from. Every entry sits in the narrow band near the diagonal where the photograph's pieces were, so the chart’s piece (0.90, 0.05) is given number 13, and 13 means (0.4286, 0.4771), which is mid grey twice over. A hard edge comes back as a flat patch.",
            ),
            trueFalse(
              "A model reading the numbers can tell an excellent match from a hopeless one.",
              false,
              "The chart’s piece (0.05, 0.05) lands on entry 11 at a squared gap of 0.001 and its piece (0.90, 0.05) lands on entry 13 at 0.404696, four hundred times as large, and what goes downstream is the number 11 and the number 13 and nothing else. Carrying the gap alongside the number is possible and is a different scheme, one that is no longer sending whole numbers. So the rounding error has to be measured by whoever chose the table and cannot be noticed later.",
            ),
        ],
        },
        {
          title: "Part 6. Choosing the Table, and Entries That Never Win",
          content: (
            <>
              <SubSection title="21. Where the table comes from">
                <p>
                  Nothing so far has said how the entries were placed, and the
                  answer is that they were fitted. Start from some positions,
                  give every piece to the nearest, move each entry to the mean of
                  the pieces that chose it, and repeat until nothing moves. That
                  is Lloyd&rsquo;s procedure and it is k-means, and the entries
                  used everywhere on this page are the centres it settles on.
                </p>
                <p>
                  It inherits every property of that procedure, including the
                  awkward one that it finds a local answer rather than the best
                  one and which local answer depends on where it started. On this
                  photograph that turns out to matter very little. Six different
                  starting draws at eight entries reach two answers, 0.0018756
                  and 0.0018772, which differ in the sixth decimal place. That is
                  a fact about this collection, whose pieces lie along a line,
                  rather than a guarantee, and on a collection with several
                  genuinely different good tables the spread would be real.
                </p>
                <KeepInMind>
                  The table is fitted, by the same alternating procedure the
                  clustering page describes. It is a local answer, and here the
                  starting draw moved it by less than a part in a thousand.
                </KeepInMind>
              </SubSection>

              <SubSection title="22. Entries the collection never asks for">
                <p>
                  An entry that no piece is ever nearest to is a row of the table
                  that is carried, transmitted and never used. It costs bits on
                  every piece, since the number of bits is set by the size of the
                  table and not by how much of it is live, and it returns
                  nothing. Fitted on the collection it will quantise, the
                  procedure leaves none of these, and every table on the
                  photograph up to 32 entries has all of them in use.
                </p>
                <p>
                  Fit on half the photograph and measure on the other half and
                  they appear. The table below fits on the top 64 pieces and then
                  quantises both halves, and at sixteen entries the half it never
                  saw asks for only ten of them while rounding three times worse
                  than the half it was fitted on.
                </p>
                <UnusedEntriesTable />
                <p>
                  The last column is the same idea taken further, a table fitted
                  on the whole photograph and put to the printed chart, where 27
                  of 32 entries are never asked for. A model reading five
                  distinct numbers out of a possible 32 is paying five bits a
                  piece to say something that needed three, and nothing in the
                  numbers says so.
                </p>
                <KeepInMind>
                  An unused entry is capacity paid for and not received, and it
                  appears as soon as the collection being quantised is not the
                  collection the table was chosen from. Counting the distinct
                  numbers a table actually produces is the cheapest check there
                  is.
                </KeepInMind>
              </SubSection>

              <SubSection title="23. The two ends of the range">
                <p>
                  The smallest table has one entry, and it is worth looking at
                  because it is exactly the case where the method does nothing.
                  Every piece becomes the number 0, the number costs zero bits
                  because it could not have been anything else, and the rounding
                  error is 0.113862, which is precisely the mean squared distance
                  from the pieces to their own mean. The single entry is the
                  mean, so the error is the spread of the collection and the
                  numbers carry none of it.
                </p>
                <p>
                  The largest table is the one section 17 reached, 53 entries
                  for the photograph, where each piece has its own number and
                  the error is as close to zero as float arithmetic gets. Between those two ends is the entire method, and
                  the only thing being traded along the way is bits against
                  error.
                </p>
                <NumberTable
                  headings={["table size", "what the numbers carry", "rounding error"]}
                  rows={[
                    ["1 entry", "nothing, 0 bits per piece", "0.113862, the spread about the mean"],
                    ["16 entries", "4 bits per piece", "0.000418"],
                    ["53 entries", "which of the 53 pieces, about 5.73 bits", "4.6 × 10⁻³³, which is zero"],
                    ["54 entries", "nothing, the table cannot be built", "not defined"],
                  ]}
                />
                <KeepInMind>
                  One entry leaves the numbers carrying nothing and the error at the
                  whole spread of the collection, and as many entries as there
                  are different pieces leaves the error at zero with the
                  numbers carrying the piece itself. Every table size worth
                  choosing lies strictly between those two, so the size is
                  always a position on that trade.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 7. Where the Method Stops Being Defined",
          content: (
            <>
              <SubSection title="24. What any complete description has to settle">
                <p>
                  Several of the things this page has shown are decisions taken
                  alongside the rule rather than consequences of it, and a
                  description of the method that leaves them out has not
                  described it. There
                  are five, and each is a real choice with a cost attached rather
                  than a detail.
                </p>
                <DerivationTable
                  expressionHeading="what must be settled"
                  reasonHeading="what turns on it"
                  rows={[
                    {
                      expression: "what a piece is",
                      reason:
                        "a pair of pixels here, a patch of sixteen or sixty-four in an image coder, a frame of features in a speech model. This fixes how many numbers a picture becomes and how much structure a single number can capture, and the two pull against each other.",
                    },
                    {
                      expression: "how many entries",
                      reason:
                        "the bits per piece are the logarithm of this number, so it is the whole of what everything downstream pays. Bounded above by the number of different pieces, since beyond that two entries must coincide.",
                    },
                    {
                      expression: "what near means",
                      reason:
                        "the straight-line distance is a choice, not a definition of nearness, and it is tied to the choice of squares in the error and to the mean in the fitting step. Change it and the entry a piece lands on can change, which is section 26.",
                    },
                    {
                      expression: "how ties are broken",
                      reason:
                        "the earlier position here. Any rule is arbitrary and no rule at all means two correct implementations disagree, which section 7 shows costs nothing in error and changes which numbers come out.",
                    },
                    {
                      expression: "where the table came from",
                      reason:
                        "which collection it was fitted on, since the answer it gives on anything else is a rounding to a table chosen for something different. The 249.5 times of section 19 is what that costs when the two differ sharply.",
                    },
                  ]}
                />
                <KeepInMind>
                  Five decisions, and only the first two are usually written
                  down. The other three are where two descriptions of the same
                  method quietly stop agreeing.
                </KeepInMind>
              </SubSection>

              <SubSection title="25. Where the arithmetic runs out">
                <p>
                  Separately from the choices there are inputs on which the rule
                  has no answer at all, and they are worth separating from the
                  choices because arguing about them is wasted effort. In each
                  case something the rule needs is a quantity the input does not
                  have. The table gathers them, with what the mathematics says.
                </p>
                <DerivationTable
                  expressionHeading="the case"
                  reasonHeading="what is undefined, or what must be decided"
                  rows={[
                    {
                      expression: "a table with no entries",
                      reason:
                        "undefined, with no choice attached. Nearest is the smallest of a set of distances, and there are no distances to take the smallest of, so there is no answer rather than a bad one.",
                    },
                    {
                      expression: "two entries at the same point",
                      reason:
                        "undefined as a vocabulary. The number of an entry is its position, so one vector at two positions has two numbers, and every piece near it goes to whichever a tie rule prefers while the other number is never produced and means the same thing. Fitting more entries than a collection has different pieces forces it, which is why a table of 54 cannot exist for a picture holding 53 different pieces.",
                    },
                    {
                      expression: "a piece with a different number of coordinates",
                      reason:
                        "undefined. A distance is a sum over matched coordinates, and there is no pairing between a piece of three numbers and an entry of two, so the first step of the rule cannot begin.",
                    },
                    {
                      expression: "a coordinate that is not a number",
                      reason:
                        "undefined. Every distance involving it is not a number either, so no comparison between two of them holds and nearest names nothing. A comparison against such a value is false whichever way it is asked, which is why the case has to be excluded before the search rather than noticed during it.",
                    },
                    {
                      expression: "a coordinate that is infinite",
                      reason:
                        "undefined in a second way. Every distance from that piece is infinite, so every entry ties with every other, and the tie rule exists to choose between two entries that are equally good rather than between entries none of which is good at all.",
                    },
                    {
                      expression: "a number no entry owns",
                      reason:
                        "undefined on the way back. A table of 16 entries owns 0 to 15, and there is nothing for 16 to mean. This is the case a model generating numbers can reach, since nothing about a generated number keeps it in range.",
                    },
                    {
                      expression: "a piece exactly between two entries",
                      reason:
                        "defined only once a convention is added, since nearest is not unique. The convention costs nothing in error, as section 7 measures, and decides which numbers come out, so two implementations without the same one disagree on inputs both handle correctly.",
                    },
                    {
                      expression: "a piece nowhere near any entry",
                      reason:
                        "defined, and that is the problem. The rule always answers, since some entry is nearest however far away it is, so an input from outside anything the table was chosen for is rounded silently. A squared gap of 0.404696 and one of 0.001 both come back as one whole number.",
                    },
                    {
                      expression: "the distance between two of the numbers",
                      reason:
                        "meaningless, exactly as it is for a word vocabulary. A number is a position in a list, so numbers 3 and 4 need not name nearby entries, and any ordering the fitting happened to produce is an accident of it. The entries have positions in a space; the numbers do not inherit them.",
                    },
                    {
                      expression: "an entry that no piece is nearest to",
                      reason:
                        "well defined and quietly wasteful. Every piece still gets an answer, the bits per piece are still set by the size of the table, and the capacity of that row is simply not received. Nothing about the answers indicates it, so the distinct numbers actually produced have to be counted.",
                    },
                  ]}
                />
                <KeepInMind>
                  Two of these are worth carrying. Two entries at one point
                  breaks the vocabulary rather than the arithmetic, which is why
                  a table cannot be larger than the variety of what it was fitted
                  on. And the rule answers everywhere, including on inputs it has
                  no business answering about, so nothing downstream will ever
                  find out.
                </KeepInMind>
              </SubSection>

              <SubSection title="26. Nearest, under a distance somebody chose">
                <p>
                  The third of the five decisions in section 24 deserves its own
                  measurement, because it is the one most often read as a
                  definition. Nearest is a property of two vectors together with
                  a rule for measuring rather than of the two vectors alone, and
                  the rule used throughout this page is the straight line.
                  Adding the two coordinate gaps instead is an equally ordinary
                  rule, and it does not always give the same answer.
                </p>
                <NearDisagreementTable />
                <p>
                  Of the photograph&rsquo;s 128 pieces against a table of eight entries, exactly one changes hands. The piece (0.13, 0.30) is 0.1078 from entry 5 and 0.1303 from entry 1 by the straight line, so it goes to entry 5, and it is 0.1480 from entry 5 and 0.1437 from entry 1 by the sum of the gaps, so it goes to entry 1.
                </p>
                <p>
                  One piece in 128 is a small effect, and it is not zero. The choice is constrained in a second way as well, since the straight line is the measure the fitting step lowers, so changing the rule used at lookup time without changing the one used at fitting time leaves the two halves of the method aiming at different quantities.
                </p>
                <KeepInMind>
                  The straight line is a choice with a reason behind it rather
                  than the only option, and the reason is that it is the measure
                  the mean minimises. Any description that says nearest without
                  saying under what measure has left a decision unstated.
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 6 and 7",
          quiz: [
            trueFalse(
              "On the photograph, every table up to 32 entries chosen from all 128 pieces has every entry in use, and entries nobody asks for appear only when the pieces being quantised are not the pieces the table was chosen from.",
              true,
              "Fitted on the collection it will quantise, the procedure leaves none of them. Fitting on the top 64 pieces leaves the unseen half asking for only ten of sixteen, and a table fitted on the whole photograph and put to the printed chart has 27 of 32 never asked for. A table larger than the collection needs is the other thing a reader might blame, and on this photograph it is not the cause.",
            ),
            trueFalse(
              "Six starting draws at eight entries reached 0.0018756 and 0.0018772, which shows the fitting procedure finds the best table.",
              false,
              "Lloyd’s procedure finds a local answer, and which one it finds depends on where it started. Agreement to the sixth decimal place is a fact about this collection, whose pieces lie along a line, rather than a guarantee. On a collection with several genuinely different good tables the spread would be real.",
            ),
            trueFalse(
              "A table of one entry leaves the rounding error at the whole spread of the collection, which on the photograph is 0.113862.",
              true,
              "The single entry is the mean of the pieces, so the error is precisely the mean squared distance from the pieces to their own mean. The number costs zero bits, because it could not have been anything else, and the numbers therefore carry none of the collection. That end of the trade and the 53-entry end bracket the entire method.",
            ),
            choice(
              "Measuring nearest by the sum of the coordinate gaps rather than by the straight line, on the photograph’s 128 pieces against eight entries, changes how many assignments?",
              ["None", "One", "About a third", "All of them, since the table was fitted under the straight line"],
              1,
              "The piece (0.13, 0.30) is nearer entry 5 by the straight line and nearer entry 1 by the sum of the gaps, and it is the only one that changes hands. One in 128 is a small effect and it is not zero. The sharper constraint is that the straight line is the measure the fitting step lowers, so changing the rule at lookup time alone leaves the two halves of the method aiming at different quantities.",
            ),
            several(
              "Which of these inputs leave the nearest-entry rule with no answer at all, rather than with an answer that has to be read with care?",
              [
                "A table with no entries",
                "A coordinate that is not a number",
                "A piece nowhere near any entry",
                "An entry that no piece is nearest to",
              ],
              [0, 1],
              "Nearest is the smallest of a set of distances, and an empty table has no distances to take the smallest of, while a coordinate that is not a number makes every distance involving it not a number either, so no comparison between two of them holds. A piece far from every entry is the opposite problem, since some entry is nearest however far away it is and the rule answers silently. An entry no piece chooses is well defined and quietly wasteful, which is why the distinct numbers a table produces have to be counted.",
            ),
        ],
        },
        {
          title: "Practice. Quantising the Photograph With the Library",
          practice: [
            exercise(
              "Four vectors against three entries",
              ["Build the table of section 6, with entries at (0, 0), (4, 0) and (0, 3), and quantise the four vectors (1, 0), (3, 1), (1, 2) and (2, 0) against it. Print the number each vector gets, the vector each one comes back as, and the rounding error. Then write the same three entries down with (4, 0) first and print the numbers again.", "Section 6 arrived at the numbers 0, 1, 2 and 0, and section 11 at a rounding error of 2.25. Reordering the entries should move exactly one of the four numbers, the tied one, and leave the error where it was."],
              `from oop_ml import Codebook, CodebookQuantizer

entries = [[0.0, 0.0], [4.0, 0.0], [0.0, 3.0]]
vectors = [[1.0, 0.0], [3.0, 1.0], [1.0, 2.0], [2.0, 0.0]]

quantizer = CodebookQuantizer(codebook=Codebook(entries))
# Quantise the four vectors, then print their ids, the vector each comes
# back as, and the rounding error to two places.

# Build a second quantizer whose table lists (4, 0) first, quantise the
# same four vectors, and print its ids and its rounding error.`,
              `from oop_ml import Codebook, CodebookQuantizer

entries = [[0.0, 0.0], [4.0, 0.0], [0.0, 3.0]]
vectors = [[1.0, 0.0], [3.0, 1.0], [1.0, 2.0], [2.0, 0.0]]

quantizer = CodebookQuantizer(codebook=Codebook(entries))
assignment = quantizer.quantize(vectors)
print(f"ids {assignment.ids}")
for vector, back in zip(vectors, assignment.reconstruction):
    print(f"{vector} comes back as {back.tolist()}")
print(f"rounding error {assignment.distortion:.2f}")

reordered = CodebookQuantizer(codebook=Codebook([[4.0, 0.0], [0.0, 0.0], [0.0, 3.0]]))
again = reordered.quantize(vectors)
print(f"ids with (4, 0) first {again.ids}")
print(f"rounding error again {again.distortion:.2f}")`,
              `ids (0, 1, 2, 0)
[1.0, 0.0] comes back as [0.0, 0.0]
[3.0, 1.0] comes back as [4.0, 0.0]
[1.0, 2.0] comes back as [0.0, 3.0]
[2.0, 0.0] comes back as [0.0, 0.0]
rounding error 2.25
ids with (4, 0) first (1, 0, 2, 0)
rounding error again 2.25`,
              { hints: ["Codebook takes the list of entries, and the entry at position i owns the number i. CodebookQuantizer takes that codebook as its one field, passed by keyword.", "quantize takes the vectors as rows and answers one object carrying three things: ids, reconstruction and distortion. Those are the three names to read.", "The tie rule is the lower position, so the second table sends (2, 0) to whichever position (0, 0) now occupies, and nothing else moves."], check: numberCheck("What rounding error do the four vectors report?", 2.25, 0.005, "The squared gaps are 1, 2, 2 and 4, as section 11 works them, and the rounding error is their mean. Reordering the entries changes which number the tied vector (2, 0) is given and not how far it travelled, so the error stays at 2.25 while one id changes.") },
            ),
            exercise(
              "Choose the photograph’s table of sixteen",
              ["Build the photograph of Part 1 and cut it into its 128 pieces of two side-by-side pixels. Choose a table of sixteen entries from those pieces the way Part 6 says, as the centres a grouping settles on, quantise the pieces against it, and print the rounding error, how many of the sixteen entries are ever used, the largest squared gap any piece travelled, and how many pieces the busiest entry holds.", "Section 12 arrived at a rounding error of 0.000418, every entry in use, and a worst squared gap of 0.00243. The busiest entry’s count is not on the page, so it is the number to run for."],
              `from collections import Counter

import numpy as np
from oop_ml import Codebook, CodebookQuantizer, Feature, KMeans

rows = np.arange(16)[:, None]
columns = np.arange(16)[None, :]
background = 0.20 + 0.60 * (columns / 15)
reach = np.sqrt((rows - 5.0) ** 2 + (columns - 6.0) ** 2)
photograph = np.round(np.clip(background - 0.55 * np.exp(-(reach ** 2) / 12.0), 0.0, 1.0), 2)
pieces = photograph.reshape(-1, 2)

features = [Feature("left", pieces[:, 0]), Feature("right", pieces[:, 1])]
# Fit a grouping of sixteen clusters with random_seed=7, turn its centroids
# into a codebook, and quantise the pieces. Print how many different pieces
# there are, the rounding error to six places, how many entries are in use,
# the largest squared gap to five places, and the busiest entry's count.`,
              `from collections import Counter

import numpy as np
from oop_ml import Codebook, CodebookQuantizer, Feature, KMeans

rows = np.arange(16)[:, None]
columns = np.arange(16)[None, :]
background = 0.20 + 0.60 * (columns / 15)
reach = np.sqrt((rows - 5.0) ** 2 + (columns - 6.0) ** 2)
photograph = np.round(np.clip(background - 0.55 * np.exp(-(reach ** 2) / 12.0), 0.0, 1.0), 2)
pieces = photograph.reshape(-1, 2)

features = [Feature("left", pieces[:, 0]), Feature("right", pieces[:, 1])]
grouping = KMeans(n_clusters=16, random_seed=7).fit(features)
quantizer = CodebookQuantizer(codebook=Codebook.from_centroids(grouping.centroids))
assignment = quantizer.quantize(pieces)

gaps = np.sum((pieces - assignment.reconstruction) ** 2, axis=1)
usage = Counter(assignment.ids)
print(f"different pieces {len(np.unique(pieces, axis=0))}")
print(f"rounding error {assignment.distortion:.6f}")
print(f"entries in use {len(usage)} of 16")
print(f"largest squared gap {gaps.max():.5f}")
print(f"busiest entry holds {usage.most_common(1)[0][1]} pieces")`,
              `different pieces 53
rounding error 0.000418
entries in use 16 of 16
largest squared gap 0.00243
busiest entry holds 17 pieces`,
              { hints: ["Feature takes a name and a column of values, and the grouping is fitted on a list of two of them, one per coordinate, exactly as the k-means page fits its own rows.", "Codebook.from_centroids takes the fitted grouping’s centroids and makes cluster k into entry k, which is section 8 as a single call.", "A piece’s squared gap is the squared difference between the piece and its reconstruction, summed over its two coordinates. Subtracting the two blocks, squaring and summing along each row gives one number per piece.", "A Counter over the ids answers both questions at once: its length is how many entries were used, and most_common(1) is the busiest entry with its count."], check: numberCheck("How many pieces does the busiest of the sixteen entries hold?", 17, 0.5, "Sixteen entries sharing 128 pieces evenly would hold eight each, and the busiest holds seventeen, because the pieces lie in a narrow band along the diagonal and the entries are placed where the pieces fell rather than at equal spacing. The same count read from the other end is section 22’s check, since an entry holding zero pieces is capacity paid for and never received.") },
            ),
            exercise(
              "Put the photograph’s table to the printed chart",
              ["Build the printed chart of Part 1 beside the photograph, choose the photograph’s table of sixteen entries as before, and quantise the chart’s pieces against it. Print the chart’s rounding error, how many times worse it is than the photograph’s own under the same table, and how many of the sixteen entries the chart never asks for.", "Section 19 arrived at 0.104290, 249.5 times worse, with 11 entries never used. Section 20 reads the worst-matched piece together with its number, so print that piece, the number it was given and its squared gap as well."],
              `import numpy as np
from oop_ml import Codebook, CodebookQuantizer, Feature, KMeans

rows = np.arange(16)[:, None]
columns = np.arange(16)[None, :]
background = 0.20 + 0.60 * (columns / 15)
reach = np.sqrt((rows - 5.0) ** 2 + (columns - 6.0) ** 2)
photograph = np.round(np.clip(background - 0.55 * np.exp(-(reach ** 2) / 12.0), 0.0, 1.0), 2)
pieces = photograph.reshape(-1, 2)
stripes = ((columns // 3) % 2 == 0).astype(float)
level = np.where(rows < 8, 0.9, 0.5)
chart_pieces = np.round(np.where(stripes > 0, level, 0.05), 2).reshape(-1, 2)

features = [Feature("left", pieces[:, 0]), Feature("right", pieces[:, 1])]
grouping = KMeans(n_clusters=16, random_seed=7).fit(features)
quantizer = CodebookQuantizer(codebook=Codebook.from_centroids(grouping.centroids))
at_home = quantizer.quantize(pieces)
# Quantise the chart's pieces with the same quantizer. Print the chart's
# rounding error to six places, how many times worse it is than at_home to
# one place, how many entries the chart never asks for, and the worst-matched
# chart piece with the number it was given and its squared gap.`,
              `import numpy as np
from oop_ml import Codebook, CodebookQuantizer, Feature, KMeans

rows = np.arange(16)[:, None]
columns = np.arange(16)[None, :]
background = 0.20 + 0.60 * (columns / 15)
reach = np.sqrt((rows - 5.0) ** 2 + (columns - 6.0) ** 2)
photograph = np.round(np.clip(background - 0.55 * np.exp(-(reach ** 2) / 12.0), 0.0, 1.0), 2)
pieces = photograph.reshape(-1, 2)
stripes = ((columns // 3) % 2 == 0).astype(float)
level = np.where(rows < 8, 0.9, 0.5)
chart_pieces = np.round(np.where(stripes > 0, level, 0.05), 2).reshape(-1, 2)

features = [Feature("left", pieces[:, 0]), Feature("right", pieces[:, 1])]
grouping = KMeans(n_clusters=16, random_seed=7).fit(features)
quantizer = CodebookQuantizer(codebook=Codebook.from_centroids(grouping.centroids))
at_home = quantizer.quantize(pieces)
away = quantizer.quantize(chart_pieces)

gaps = np.sum((chart_pieces - away.reconstruction) ** 2, axis=1)
worst = int(np.argmax(gaps))
print(f"chart rounding error {away.distortion:.6f}")
print(f"times worse than at home {away.distortion / at_home.distortion:.1f}")
print(f"entries never asked for {16 - len(set(away.ids))} of 16")
print(f"worst piece {chart_pieces[worst].tolist()} became number {away.ids[worst]}")
print(f"its squared gap {gaps[worst]:.6f}")`,
              `chart rounding error 0.104290
times worse than at home 249.5
entries never asked for 11 of 16
worst piece [0.9, 0.05] became number 13
its squared gap 0.404696`,
              { hints: ["The quantizer is already built, so the chart needs no fit of its own. One more call to quantize, with the chart’s pieces, is the whole of the lookup.", "The ids are a tuple with one entry per piece, so the distinct numbers produced are a set of it, and the entries never asked for are the sixteen less that set’s size.", "The worst piece is the row where the squared gap is largest, which argmax over the per-piece gaps finds, and the same position indexes the ids."], check: numberCheck("How many times worse is the chart’s rounding error than the photograph’s own under the same table?", 249.5, 0.1, "The sixteen entries all sit in the narrow band near the diagonal where the photograph’s pieces were, and the chart’s pieces include (0.90, 0.05), a bright pixel beside a dark one, which no entry has any reason to be near. That piece is given number 13 at a squared gap of 0.404696, and 11 of the 16 entries are never asked for, so the table is paying four bits a piece for numbers that could have been said in three.") },
            ),
            exercise(
              "Ask for a table the photograph cannot supply",
              ["Section 17 says the photograph admits a table of 53 entries and not one of 54. Fit the grouping at 53 entries, build the codebook and print its rounding error, then do the same at 54 and see which step refuses.", "The grouping itself may settle on 54 centres without complaint. Catch the library’s own error wherever it is raised, print the name of its class and its message, and notice which of the two steps raised it."],
              `import numpy as np
from oop_ml import Codebook, CodebookQuantizer, Feature, KMeans, MLLibError

rows = np.arange(16)[:, None]
columns = np.arange(16)[None, :]
background = 0.20 + 0.60 * (columns / 15)
reach = np.sqrt((rows - 5.0) ** 2 + (columns - 6.0) ** 2)
photograph = np.round(np.clip(background - 0.55 * np.exp(-(reach ** 2) / 12.0), 0.0, 1.0), 2)
pieces = photograph.reshape(-1, 2)
features = [Feature("left", pieces[:, 0]), Feature("right", pieces[:, 1])]

# For 53 entries and then 54: fit the grouping, build the codebook from its
# centroids, quantise the pieces and print the rounding error in scientific
# notation. Catch the library's own error when a step refuses, and print
# its class name and its message.`,
              `import numpy as np
from oop_ml import Codebook, CodebookQuantizer, Feature, KMeans, MLLibError

rows = np.arange(16)[:, None]
columns = np.arange(16)[None, :]
background = 0.20 + 0.60 * (columns / 15)
reach = np.sqrt((rows - 5.0) ** 2 + (columns - 6.0) ** 2)
photograph = np.round(np.clip(background - 0.55 * np.exp(-(reach ** 2) / 12.0), 0.0, 1.0), 2)
pieces = photograph.reshape(-1, 2)
features = [Feature("left", pieces[:, 0]), Feature("right", pieces[:, 1])]

for n_entries in (53, 54):
    grouping = KMeans(n_clusters=n_entries, random_seed=7).fit(features)
    print(f"{n_entries} entries: the grouping fitted")
    try:
        codebook = Codebook.from_centroids(grouping.centroids)
    except MLLibError as refusal:
        print(f"  {type(refusal).__name__}: {refusal}")
        continue
    assignment = CodebookQuantizer(codebook=codebook).quantize(pieces)
    print(f"  rounding error {assignment.distortion:.1e}")`,
              `53 entries: the grouping fitted
  rounding error 4.6e-33
54 entries: the grouping fitted
  NonUniqueTokensError: codes 37 and 53 are the same vector, which would be two ids for one point`,
              { hints: ["Every refusal the library makes derives from MLLibError, so catching that one catches whichever specific refusal this turns out to be.", "Put the try around the codebook step on its own. If the grouping fits and the codebook refuses, that tells you which half of the method has the rule that 54 breaks.", "Two entries at the same point is the case section 25 calls undefined as a vocabulary, since one vector at two positions would be two numbers meaning one thing, and that is what the refusal says in its own words."] },
            ),
          ],
        },
      ]}
    />
  );
}
