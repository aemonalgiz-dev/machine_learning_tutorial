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
import { CodebookExplorer } from "@/components/widgets/CodebookExplorer";
import { DistortionCurveChart } from "@/components/widgets/DistortionCurveChart";
import { NearDisagreementTable } from "@/components/widgets/NearDisagreementTable";
import { NearestEntryTable } from "@/components/widgets/NearestEntryTable";
import { SameNumberTable } from "@/components/widgets/SameNumberTable";
import { UnusedEntriesTable } from "@/components/widgets/UnusedEntriesTable";

export const metadata: Metadata = {
  title: "Codebook Quantisation · oop_ml",
  description:
    "Keep a table of representative vectors and give a picture the number of whichever is nearest. The round trip is lossy, and this page measures by how much.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function CodebookQuantisationPage() {
  return (
    <ConceptPage
      title="Codebook Quantisation"
      tagline="Vector quantisation, which keeps a table of representative vectors, answers with whichever is nearest, and pays a rounding error you can measure."
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
      history={
        <>
          <p>
            The question was forced on Bell Labs by the telephone. Pulse-code
            modulation carries speech as whole numbers, so somebody has to
            decide which numbers, and in 1957 Stuart Lloyd wrote an internal
            report called &ldquo;Least squares quantization in PCM&rdquo; that
            answered it for a single voltage. Choose the levels, put every
            sample on the nearest one, then move each level to the mean of the
            samples that chose it, and repeat. Lloyd&rsquo;s report was not
            published until 1982, in the IEEE Transactions on Information
            Theory, and in the meantime Joel Max published the same rule
            independently in 1960 as &ldquo;Quantizing for minimum
            distortion&rdquo;. Shannon had already said what such a rule
            was aiming at, in his 1959 paper on coding with a fidelity
            criterion, which is that a source can be described at a given rate
            only to within a given error and the two cannot both be improved.
          </p>
          <p>
            Lloyd&rsquo;s rule quantises one number at a time, and the step this
            page is about is quantising several at once. Yoseph Linde, Andrés
            Buzo and Robert Gray published that step in 1980, in &ldquo;An
            Algorithm for Vector Quantizer Design&rdquo; in the IEEE
            Transactions on Communications, working on speech coders where a
            frame of speech is a vector and rounding each of its numbers
            separately throws away the fact that they move together. Their
            algorithm is Lloyd&rsquo;s with vectors in place of voltages, and
            the table of representative vectors it produces is what gave the
            method its name, since a table you look a number up in is a
            codebook. That is also, exactly, the update rule of k-means, and
            the two literatures had been writing down the same procedure for
            twenty years under two names.
          </p>
          <p>
            The idea came back for a different reason. Aäron van den Oord,
            Oriol Vinyals and Koray Kavukcuoglu&rsquo;s 2017 paper
            &ldquo;Neural Discrete Representation Learning&rdquo; put a
            codebook in the middle of an image model so that a picture became a
            grid of whole numbers a second model could then be trained to
            predict, and Wei-Ning Hsu and colleagues did the same to speech in
            2021 with HuBERT, where the units a speech model reads are the
            numbers a k-means over speech features hands back. Both wanted the
            same thing this page wants, which is whole numbers out of something
            continuous, and both got it from a table and a nearest match.
          </p>
          <p>
            The page answers six questions in order. A picture is already
            numbers, so what is left for a vocabulary to do? Why can the
            brightnesses not simply be handed over as they are? What is the
            method, and where has this table been met before under another
            name? What does the round trip cost, given that unlike text it does
            not come back exactly? What does a larger table buy, and what does
            it cost? And where does the method stop being defined?
          </p>
        </>
      }
      playground={<CodebookExplorer />}
      sections={[
        {
          title: "Part 1. A Picture Is Already Numbers",
          defaultOpen: true,
          content: (
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
                  Four pictures run through the whole page, and they are not
                  four illustrations of one thing. Each one makes the same
                  measurement come out differently, and the differences are
                  where most of the argument lives. The photograph is smooth, so
                  a pixel and the pixel beside it are nearly equal almost
                  everywhere. The poster is four flat bands of tone. The
                  printed chart is hard-edged stripes. The speckled square has
                  every pixel drawn independently of every other, which is the
                  case with no structure in it at all and is the control the
                  other three are measured against.
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
                <p>
                  Rounding does not rescue it, it only hides the problem behind
                  a large number. Our brightnesses are given to two decimal
                  places, so a single pixel has 101 possible values and a piece
                  of two pixels has 101 times 101, which is 10,201 possible
                  pieces. The photograph uses 53 of them. A table of 10,201
                  entries to hold 53 that ever occur is not a description of the
                  picture, and a real sensor records far more than 101 levels,
                  so the count grows with the equipment and never with the
                  content.
                </p>
                <WhyThisWorks title="Why the count grows with the coordinates too">
                  <p>
                    The trouble compounds with the size of a piece. A piece of
                    two pixels at 101 levels each has 101 squared possibilities;
                    a piece of sixteen pixels, which is a modest patch, has 101
                    to the sixteenth, which is a number with thirty-three digits
                    in it. Listing the possibilities is not merely wasteful at
                    that size, it is not a thing that can be done, so any scheme
                    that gives a picture whole numbers has to be a scheme that
                    lists something other than the possibilities.
                  </p>
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
          ),
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
                  <p>
                    Take the second vector, (3, 1). Its gap from entry 0 is
                    (3, 1), whose squared length is 9 plus 1, which is 10. Its
                    gap from entry 1 is (&minus;1, 1), whose squared length is 1
                    plus 1, which is 2. Its gap from entry 2 is (3, &minus;2),
                    whose squared length is 9 plus 4, which is 13. The smallest
                    is 2, so the vector becomes the number 1, and what that
                    number means is the vector (4, 0).
                  </p>
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
                    The choice of squares is not neutral, and it is the same
                    choice the update rule makes. The point minimising the total
                    squared distance to a set of points is their mean, which is
                    why the step that moves an entry to the mean of the pieces
                    that chose it is the step that lowers this number. Measure
                    the miss some other way, by the sum of the coordinate gaps
                    for instance, and the minimising point is no longer the mean
                    and the procedure that chooses the table is no longer
                    guaranteed to improve. The measure of loss and the way the
                    table is chosen are one decision taken twice.
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
                <p>
                  There is a second cost that is easy to forget and, at this
                  scale, is the larger of the two. The table has to travel with
                  the numbers or they mean nothing, and sixteen entries of two
                  coordinates is 32 numbers. So the whole message is 128 small
                  numbers plus 32 brightnesses, against 256 brightnesses sent
                  plainly, and a fifth of what is sent is then the table. On a
                  picture of a few hundred pieces that overhead is real; on a
                  collection of millions of pieces sharing one table it
                  disappears, which is the scale the method was designed at and
                  not the scale of this page.
                </p>
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
                  There is a standard result for how this trade should behave
                  when the table is large. For a collection filling d
                  coordinates, the best achievable error falls roughly as the
                  table size raised to the power of minus two over d, so with
                  two coordinates a doubling should buy a factor of two, and
                  with one coordinate it should buy a factor of four. The
                  speckled square is the case that result describes, since every
                  pixel there was drawn independently and the pieces genuinely
                  fill the square, and its measured factors of 1.74 to 2.63 sit
                  around the predicted two.
                </p>
                <p>
                  The photograph does better than that, and the reason is
                  measurable rather than a matter of opinion. Its pieces do not
                  fill the plane; they lie close to the line where the two
                  brightnesses are equal, because a pixel and the pixel beside it
                  agree almost everywhere in a smooth picture. Measuring the
                  spread along that line and at right angles to it gives 163.6
                  times as much of the first as of the second, so the collection
                  is very nearly one-dimensional, and the factor predicted for
                  one dimension is four. The measured factors run 4.57, 3.24,
                  4.10, 4.49 and 7.96, four of them within a quarter of the
                  predicted four and the last one larger because by 32 entries
                  the table is close to holding every different piece the
                  photograph has, which is where any such rate law stops
                  applying. The prediction did not fail. It is stated in terms
                  of the dimensions the pieces occupy, and this
                  photograph&rsquo;s pieces occupy fewer of those than the two
                  coordinates they are written in.
                </p>
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
                  A sharp bend in the curve marks the number of parts the
                  collection has. A smooth curve means there is no natural
                  answer there, and the table size is then a budget rather than
                  a discovery.
                </KeepInMind>
              </SubSection>

              <SubSection title="17. Where the curve stops">
                <p>
                  The curve cannot go on forever, and where it stops is decided
                  by the collection rather than by the method. The photograph has
                  53 different pieces, so a table of 53 entries can hold one of
                  each and reproduce it exactly, and the rounding error at that
                  size comes out at 4.6 × 10⁻³³, which is zero
                  to every bit the arithmetic keeps. Asking for 54
                  is asking for an entry that has nothing of its own to be, and
                  the result is two entries at one point, which is two numbers
                  meaning one thing.
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
                    This is where the method is worse than the obvious
                    alternative, and it is worth saying rather than burying. A
                    fixed grid of levels, where each coordinate is rounded to one
                    of a few evenly spaced values, covers the whole square
                    whatever arrives and needs nothing fitted; it would round
                    (0.90, 0.05) to something near (0.90, 0.05). It pays for that
                    by spending entries on regions no picture ever visits, which
                    is why the fitted table wins by 249.5 times on the picture it
                    was fitted for. A fixed grid would have kept that edge and
                    would have spent some of its levels on brightness pairs this
                    photograph never produces, where the fitted table put all
                    sixteen of its entries inside the band its own pieces
                    occupy.
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
                  A model reading those numbers has no way to tell the excellent
                  match from the hopeless one, because the output alphabet is
                  whole numbers and a whole number is all it gets. That is the
                  same fact the vocabulary page ends on, that a token number says
                  which entry and nothing more, and it is sharper here, since the
                  entries do have positions in a space and it is tempting to
                  believe some of that survives. It does not. Carrying the gap
                  alongside the number is possible and is a different scheme, one
                  that is no longer sending whole numbers.
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
                  Of the photograph&rsquo;s 128 pieces against a table of eight
                  entries, exactly one changes hands. The piece (0.13, 0.30) is
                  0.1078 from entry 5 and 0.1303 from entry 1 by the straight
                  line, so it goes to entry 5, and it is 0.1480 from entry 5 and
                  0.1437 from entry 1 by the sum of the gaps, so it goes to
                  entry 1. One piece in 128 is a small effect, and it is not
                  zero. The choice is constrained in a second way as well, since
                  the straight line is the measure the fitting step lowers, so
                  changing the rule used at lookup time without changing the one
                  used at fitting time leaves the two halves of the method
                  aiming at different quantities.
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
      ]}
    />
  );
}
