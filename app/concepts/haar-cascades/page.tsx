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
import { ArrangementGallery } from "@/components/widgets/ArrangementGallery";
import { CascadeStageBoard } from "@/components/widgets/CascadeStageBoard";
import { CascadeSweepBoard } from "@/components/widgets/CascadeSweepBoard";
import { FeatureCountCurve } from "@/components/widgets/FeatureCountCurve";
import { HeldOutFunnel } from "@/components/widgets/HeldOutFunnel";
import { IntegralCornerBoard } from "@/components/widgets/IntegralCornerBoard";
import { PoseGallery } from "@/components/widgets/PoseGallery";
import { ReadingCostPanel } from "@/components/widgets/ReadingCostPanel";
import { SceneCostComparison } from "@/components/widgets/SceneCostComparison";
import { SweepCostComparison } from "@/components/widgets/SweepCostComparison";

export const metadata: Metadata = {
  title: "Haar Cascades · oop_ml",
  description:
    "Crude rectangular readings, made free to take at any size, and ordered so that almost every window is thrown away after two of them.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function HaarCascadesPage() {
  return (
    <ConceptPage
      title="Haar Cascades"
      tagline="Crude rectangular readings, made free to take at any size, and ordered so that almost every window is thrown away after two of them."
      prerequisites={
        <>
          You should have met the idea of sliding a small window across a larger
          picture and scoring it at every position, which is what{" "}
          <Link href="/concepts/template-matching" className={link}>
            template matching
          </Link>{" "}
          does, and the idea of a classifier that asks one question about one
          measurement and answers yes or no, which is the single split a{" "}
          <Link href="/concepts/decision-trees" className={link}>
            decision tree
          </Link>{" "}
          is built out of. Nothing here needs calculus. The arithmetic that
          matters most on this page is one subtraction repeated four times.
        </>
      }
      history={
        <>
          <p>
            In 2001 a detector that could find faces in a photograph existed and
            a detector that could find them while the shutter was open did not.
            The methods of the late nineties, including the one this page owes
            most to, worked by scoring every position of a picture with a
            classifier that read a great many measurements, and the cost was the
            number of positions multiplied by the cost of one score. Constantine
            Papageorgiou, Michael Oren and Tomaso Poggio, at the Center for
            Biological and Computational Learning at MIT, had shown in 1998, in
            &ldquo;A general framework for object detection&rdquo;, that a
            dictionary of Haar wavelet responses over a patch was a better thing
            to hand a classifier than the pixels themselves, since a difference
            between neighbouring regions survives a change in lighting that the
            pixel values do not. Their detector found pedestrians and faces, and
            it was slow.
          </p>
          <p>
            Paul Viola, at Mitsubishi Electric Research Laboratories, and
            Michael Jones, then at the Compaq Cambridge Research Laboratory,
            published &ldquo;Rapid object detection using a boosted cascade of
            simple features&rdquo; at the 2001 computer vision conference, and
            extended it in 2004 as &ldquo;Robust real-time face
            detection&rdquo;. Three things are in that paper, and two of them
            were borrowed. The first is the integral image, which is the
            summed-area table Franklin Crow had described in 1984 for filtering
            textures in graphics, borrowed to make a rectangle&rsquo;s total
            cost four table lookups instead of its area. The second is choosing
            which rectangle readings to use by boosting, which Yoav Freund and
            Robert Schapire had put on a firm footing in the mid nineties. The
            third, and the one the paper is actually remembered for, is
            arranging the chosen rules in stages, ordered so that a stage of two
            rules runs on every window and a stage of two hundred runs on the
            few that got that far. Their published detector had thirty-eight
            stages and over six thousand readings, was trained on a base window
            of twenty-four pixels square and roughly five thousand hand-marked
            faces, and ran at about fifteen frames a second on a 700 megahertz
            machine.
          </p>
          <p>
            The name is a small piece of history in itself. The readings are not
            Haar wavelets, which are a proper orthogonal basis; they are
            differences of neighbouring rectangle sums, which resemble the
            simplest Haar basis functions closely enough that the community
            called them Haar-like and then dropped the qualifier. Rainer
            Lienhart and Jochen Maydt at Intel added rectangles turned
            forty-five degrees in 2002, and the trained files that shipped with
            the open source vision libraries from about that year are why so
            much software of the following decade could draw a green box round a
            face without anyone involved having read the paper. Fifteen frames a
            second on the hardware of 2001 is what made finding a face something
            that could happen while the shutter was open rather than something a
            workstation did afterwards. The running example on this page is not
            a face, since a face detector is this mechanism plus a corpus nobody
            here has; it is a bright band across a cluttered twelve by twelve
            window, which is small enough that every number below can be
            checked.
          </p>
        </>
      }
      playground={
        <div>
          <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            One sweep, stage by stage
          </h2>
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
            A detector fitted on bright bands is swept across a scene with three
            of them hidden in it. Choose a stage and the dots are the window
            positions still under consideration when that stage ran.
          </p>
          <CascadeSweepBoard />
        </div>
      }
      sections={[
        {
          title: "Part 1. What A Search Costs Before Any Of This",
          defaultOpen: true,
          content: (
            <>
              <SubSection title="1. Looking for something means asking everywhere">
                <p>
                  Suppose we are looking for a bright band across a cluttered
                  patch, and the patch is twelve pixels square. The thing we are
                  looking for could be anywhere in the picture, so the only
                  honest way to find it is to ask the question at every place it
                  could be, which means sliding a twelve by twelve window one
                  pixel at a time and asking about each position in turn. A
                  scene sixty-six pixels square holds 3,025 such positions, and
                  that number is fixed before we have decided anything at all
                  about how the question is answered.
                </p>
                <p>
                  That is already the whole difficulty in miniature. Whatever we
                  do to answer &ldquo;is the band here&rdquo;, we are going to
                  do it three thousand times over on a scene the size of a
                  postage stamp, and a real photograph is a thousand times
                  larger and has to be searched at several sizes as well. So the
                  first thing to settle is how little a single answer can be
                  made to cost, and how accurate the answer is comes after that.
                </p>
                <KeepInMind>
                  <p>
                    The count of positions is not something the method chooses.
                    It follows from the size of the picture and the size of the
                    window, and every design decision after this one is about
                    the cost of a single position rather than about how many
                    there are.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="2. And every question is a sum over a rectangle">
                <p>
                  What we want to ask about a window is something like whether
                  its middle rows are brighter than the rows above and below
                  them, and to ask that we have to add up the brightness inside
                  each of those regions. Adding up a rectangle costs one
                  addition per pixel, so the cost of a question grows with the
                  size of the region it asks about. That is the wrong way round.
                  A large region is exactly the one worth asking about, since it
                  averages away the speckle, and it is the one that costs most.
                </p>
                <p>
                  It is worth seeing how badly wrong. On a picture six hundred
                  pixels square, timing two thousand repetitions of each, adding
                  up a one-pixel box and adding up the whole picture differ by a
                  factor of between 107 and 130 across the six runs I measured.
                  The box holds 360,000 times as many pixels and the arithmetic
                  underneath is vectorised, so the ratio is far below the count
                  of pixels, and it is still two orders of magnitude.
                </p>
                <InAModel>
                  <p>
                    Multiply the two together and the problem has its shape. If
                    a window admits a few thousand questions, and each question
                    costs the area of the rectangles it reads, and there are
                    three thousand windows, then answering the question honestly
                    at every position is a calculation that will not finish
                    while anyone is waiting for it, and step 11 puts a figure on
                    how far from finishing it is.
                  </p>
                </InAModel>
              </SubSection>

              <SubSection title="3. What the method is, before any of its parts">
                <p>
                  The method on this page is the Viola and Jones detector, which
                  everybody calls a Haar cascade, and it is three separable
                  ideas that happen to fit together. The first is a table of
                  running totals that makes any rectangle&rsquo;s sum cost four
                  lookups whatever its size, so the cost of a question stops
                  depending on how large a region it asks about. The second is a
                  family of very crude readings built out of those sums, each of
                  them the total over some bright cells minus the total over
                  some dark ones. The third is an ordering, in which the
                  readings are grouped into stages and a window that fails a
                  stage is dropped without the later stages ever seeing it.
                </p>
                <p>
                  Each of the three is worth having on its own, and the third is
                  the one the method is named for. We take them in that order,
                  because the second is only affordable given the first, and the
                  third only becomes necessary once we have counted how many
                  readings the second offers.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 2. A Table Where Every Entry Is A Running Total",
          content: (
            <>
              <SubSection title="4. Every entry is everything above and to the left">
                <p>
                  Take the picture and build a second grid the same shape, in
                  which the entry at a given row and column is the total of
                  every pixel that lies above it and to the left of it, itself
                  included. Nothing about that is clever; it is a running total
                  in two directions instead of one, and it can be filled in with
                  a single pass over the picture in which each entry is read off
                  from its three already-filled neighbours.
                </p>
                <Equation>
                  {
                    "table[r, c] = picture[r, c] + table[r−1, c] + table[r, c−1] − table[r−1, c−1]"
                  }
                </Equation>
                <p>
                  The last term is there because the region above and the region
                  to the left overlap in the whole corner above and to the left
                  of both, so that corner would otherwise be counted twice. In
                  practice the table is built one row and one column larger than
                  the picture, with that extra first row and column holding
                  zeros, which is not padding for its own sake. It is what lets
                  a box touching the top edge be read by the same expression as
                  a box in the middle, rather than by three special cases for
                  the boxes whose first row or first column is zero.
                </p>
                <KeepInMind>
                  <p>
                    The table is often called the integral image in vision and
                    the summed-area table in graphics, and they are the same
                    object. The graphics use came first, by seventeen years.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="5. Any rectangle from four of those entries">
                <p>
                  Now take any box at all. The entry at its bottom-right corner
                  holds everything above and to the left of that corner, which
                  is the box plus a strip above it, plus a strip to its left,
                  plus the corner region above and left of both. Subtract the
                  entry at the top-right corner and the strip above goes;
                  subtract the entry at the bottom-left corner and the strip to
                  the left goes; the corner region has now been taken away
                  twice, so add the entry at the top-left corner back.
                </p>
                <Equation>
                  {
                    "sum over the box = table[bottom, right] − table[top, right] − table[bottom, left] + table[top, left]"
                  }
                </Equation>
                <p>
                  Four reads and three additions, and not one of them mentions
                  the size of the box. The widget below draws that on a picture
                  whose pixel at row r and column c is 10r + c, so no two boxes
                  can accidentally total to the same number and every sum can be
                  worked out on paper, and on the workbench scene the rest of
                  this section of the site uses. Drag on the picture to move the
                  box, and watch the four lit entries move with it.
                </p>
                <WorkedExample>
                  <p>
                    The box three rows tall and three columns wide starting at
                    row one, column two. Its four entries are 340 at the
                    bottom-right, 10 at the top-right, 124 at the bottom-left
                    and 1 at the top-left, so the total is 340 − 10 − 124 + 1,
                    which is 207. Adding up the nine pixels inside it gives 207
                    as well, and over all 588 boxes that six by seven picture
                    holds, the two routes agree 588 times with a largest gap of
                    exactly zero.
                  </p>
                </WorkedExample>
                <IntegralCornerBoard />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Blue entries are added and red ones taken away. Look at what
                  happens when the box is dragged to the top-left corner, where
                  two of the four entries fall into the border of zeros and the
                  expression is unchanged.
                </p>
              </SubSection>

              <SubSection title="6. The same four entries whatever the box, measured">
                <p>
                  The claim that a rectangle total is a constant cost is easy to
                  state and easy to believe for the wrong reason, so it is worth
                  counting rather than asserting. A box of one pixel names four
                  table entries. A box of 360,000 pixels names four table
                  entries. That is not a saving of a factor of a few; it is the
                  removal of the size of the box from the cost altogether.
                </p>
                <p>
                  Timed rather than counted, on the same six hundred pixel
                  square picture, the table answered the whole-picture box in
                  between 1.01 and 1.11 times what it took on the one-pixel box
                  across six runs, where adding the pixels up took between 107
                  and 130 times as long. The small residue in the first figure
                  is the cache, since the four entries of the large box are four
                  corners of a large table and the four entries of the small box
                  sit next to each other.
                </p>
                <ReadingCostPanel />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  The timing is run afresh when the page is first opened, so the
                  two ratios move by a few percent from one visit to the next.
                  What does not move is the third column of the table.
                </p>
              </SubSection>

              <SubSection title="7. What the table costs before it saves anything">
                <p>
                  The table is not free. It is one pass over the picture, and it
                  allocates a grid slightly larger than the picture to hold the
                  answer, so a search that only ever reads a handful of
                  rectangles is better off adding pixels up and never building
                  it. Measured on the six hundred pixel square picture, building
                  the table took about 6,900 microseconds where one
                  whole-picture read off the table took about 1.4 and adding the
                  pixels up took about 171, so the table repays what it cost
                  after roughly forty whole-picture reads and is a loss before
                  that.
                </p>
                <p>
                  For the search this page is about, forty is nothing. There are
                  3,025 window positions and each of them reads several
                  rectangles, so the table has repaid itself before the sweep
                  has crossed the first row. It is worth saying plainly all the
                  same, because it is the one place where the obvious
                  alternative wins, and the condition under which it wins is
                  roughly forty reads.
                </p>
                <KeepInMind>
                  <p>
                    Building the table costs a pass over the picture and reading
                    a box off it costs four lookups, so the method pays a fixed
                    price to make a variable one disappear. That trade is worth
                    making when there are many boxes to read and not otherwise.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 3. What The Detector Actually Reads",
          content: (
            <>
              <SubSection title="8. Bright cells minus dark ones">
                <p>
                  Given that any rectangle total is now cheap, the detector
                  never reads a pixel again. What it reads is a small
                  arrangement of neighbouring boxes, all the same size, some of
                  which are added and some subtracted, and the number that comes
                  back is the total over the added ones minus the total over the
                  subtracted ones. A reading of that kind says something about
                  contrast between neighbouring regions, which is roughly what
                  survives when the light in the room changes, where the raw
                  brightness of a region says almost nothing that a lamp cannot
                  change.
                </p>
                <p>
                  A reading is fixed by five things and nothing else. Which
                  layout of cells it uses, how far down and how far across its
                  top-left corner sits inside the window, and how tall and wide
                  one cell is. The position is measured from the window&rsquo;s
                  own corner rather than the picture&rsquo;s, which is what lets
                  one reading be evaluated at every window position of a scene
                  from a single table built once over the whole scene.
                </p>
              </SubSection>

              <SubSection title="9. Five layouts, worked on pictures small enough to count">
                <p>
                  The original paper uses five layouts, and it is worth seeing
                  what each answers on a picture with four pixels on a side. Two
                  cells side by side, or two stacked, answer the question of
                  whether there is an edge running one way or the other. Three
                  in a row, or three in a column, set the middle cell against
                  both flanks and so answer whether there is a strip or a band.
                  Four in a chequer sets one diagonal pair against the other,
                  which neither of the first two kinds can see at all.
                </p>
                <ArrangementGallery />
                <WorkedExample>
                  <p>
                    On a four by four picture whose top two rows are one and
                    whose bottom two are zero, two cells stacked answer eight,
                    since eight ones sit above and eight zeros below. The same
                    layout turned, two cells side by side, answers exactly zero
                    on the same picture, because each cell holds two bright rows
                    and two dark ones and they cancel. Three cells in a column
                    over one bright row between two dark ones answer two, and
                    over two bright rows out of four they answer zero, because
                    the band and one flank now hold the same amount of light.
                  </p>
                </WorkedExample>
                <KeepInMind>
                  <p>
                    A reading that is large is not a reading that has found the
                    thing. It has found a contrast of a particular shape at a
                    particular place, and whether that is evidence of the target
                    is what the threshold in Part 4 is for.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Two of the five read the lamp as well as the picture">
                <p>
                  Here is something the textbook description of these readings
                  usually leaves out, and it is not a small thing. Two cells
                  added against two subtracted cancel exactly, so a layout with
                  as many added cells as subtracted answers zero on a picture
                  with no contrast in it at all, however bright that picture is.
                  The three-cell layouts have one added cell against two
                  subtracted, and they do not cancel.
                </p>
                <p>
                  Measured on a flat four by four picture with one-pixel cells,
                  the two-cell layouts and the chequer answer 0.0 whether the
                  picture reads 0.25 or 0.9, and both three-cell layouts answer
                  −0.25 on the first and −0.9 on the second. So two of the five
                  readings move when the lamp moves, which is the opposite of
                  the property the whole family was chosen for. This is not a
                  slip in the arrangement, it is what the original paper
                  describes, and the original paper answers it by normalising
                  each window&rsquo;s variance before any threshold is compared
                  against anything. No such normalising happens here, so on this
                  page the three-cell readings are the ones that would break
                  first under a change in lighting, and Part 6 measures what
                  that costs.
                </p>
                <WhyThisWorks>
                  <p>
                    Write the value of a layout as the sum over its cells of the
                    sign of that cell times the total inside it. On a picture of
                    uniform brightness b with cells of n pixels each, every
                    cell&rsquo;s total is nb, so the whole reading is nb times
                    the sum of the signs.
                  </p>
                  <Equation>
                    {"value on a flat picture = n b × (sum of the cell signs)"}
                  </Equation>
                  <p>
                    The signs of the two-cell layouts add to zero and those of
                    the chequer add to zero, so the reading is zero for any b at
                    all. The three-cell signs are one added and two subtracted,
                    which add to −1, so the reading is −nb and grows with the
                    brightness. With one-pixel cells and b of 0.9 that is −0.9,
                    which is the measured number above.
                  </p>
                </WhyThisWorks>
              </SubSection>

              <SubSection title="11. How many readings a window admits">
                <p>
                  Since a reading is fixed by a layout, a position and a cell
                  size, and every combination that fits inside the window is a
                  legitimate reading, we can count them without building them.
                  For a layout of r by c cells at a cell size of h by w, the
                  reading is rh tall and cw wide and therefore fits at (H − rh +
                  1) times (W − cw + 1) positions, and the total is that summed
                  over every cell size that fits at all and then over the five
                  layouts.
                </p>
                <NumberTable
                  headings={[
                    "Window side",
                    "Pixels",
                    "Readings admitted",
                    "Readings per pixel",
                  ]}
                  rows={[
                    ["4", "16", "136", "8.5"],
                    ["6", "36", "669", "18.58"],
                    ["8", "64", "2,056", "32.12"],
                    ["12", "144", "10,344", "71.83"],
                    ["16", "256", "32,384", "126.5"],
                    ["24", "576", "162,336", "281.83"],
                  ]}
                  caption="Counted by the arithmetic above and checked against actually building them all, on the window sizes small enough to enumerate."
                />
                <p>
                  The twenty-four pixel window is the one Viola and Jones used,
                  and it holds 576 pixels and admits 162,336 readings, which is
                  281.83 times its own pixel count. Doubling the side of a
                  window multiplies its pixels by four and its readings by
                  15.69. That number is the reason the rest of the method
                  exists, since a detector that measured every reading at every
                  position of even the small scene in the playground would be
                  doing 3,025 times 10,344, which is 31,290,600 readings, to
                  search one postage-stamp picture once.
                </p>
                <FeatureCountCurve />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Both counts are drawn on a scale where each step up is a
                  factor of ten. Look at the gap between the two lines opening
                  as the window grows.
                </p>
              </SubSection>

              <SubSection title="12. Two ways of adding four numbers, and the last bit">
                <p>
                  One more thing about reading these values, which I did not
                  expect and which is worth a paragraph because the conclusion
                  runs the wrong way. A reading&rsquo;s value is a total over
                  its cells, and there are two natural ways to write that total.
                  One adds the cells one at a time; the other hands the whole
                  run to the language&rsquo;s own summing, which since Python
                  3.12 compensates its rounding over a run of floating point
                  numbers and is therefore more accurate.
                </p>
                <p>
                  Over 200 readings taken on five small pictures, the two totals
                  disagreed on exactly one of them, by 2.2 times ten to the
                  minus sixteen. The accurate total was −0.8391149931171449 and
                  the one-at-a-time total was −0.8391149931171447. That is the
                  last bit of a double and would be beneath notice anywhere
                  else, and it is not beneath notice here, because a
                  stage&rsquo;s threshold is chosen to sit exactly on one of
                  these values. Set the threshold at the accurate total and ask
                  whether a reading is above it, and the accurate route says no
                  while the one-at-a-time route says yes. The two routes have to
                  round identically or a rule chosen on one and applied on the
                  other lands on the wrong side of its own threshold, so the
                  accurate spelling is the wrong one and both routes here add
                  one cell at a time.
                </p>
                <KeepInMind>
                  <p>
                    A threshold placed exactly on a measured value quietly makes
                    an equality test out of what looks like an inequality, so
                    anything that moves a value in its last bit moves an answer.
                    The arithmetic is not fragile; the placement of the
                    threshold is what makes the last bit matter.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 4. Choosing A Handful, And What A Stage Is",
          content: (
            <>
              <SubSection title="13. The windows the detector was trained on">
                <p>
                  This is the only method in this part of the site that is
                  fitted rather than designed, so it needs examples. The target
                  here is a bright band four rows deep across the middle of a
                  twelve by twelve window, jittered one row up or down, laid
                  over a cluttered ground and finished with a little speckle. A
                  background is that cluttered ground with no band in it. The
                  clutter is blocky rather than per-pixel, in three by three
                  blocks, and that choice is load-bearing, since per-pixel noise
                  averages away inside the very first rectangle total and would
                  have left the two classes trivially apart.
                </p>
                <p>
                  There are 50 targets and 2,000 backgrounds. That ratio is not
                  an accident of the fixture, it is the ratio the method exists
                  for, because a detector&rsquo;s negatives are every window of
                  every picture that is not the thing, and there are always
                  vastly more of them than there are of the thing. The fit
                  searches 600 readings drawn at random from the 10,344 the
                  window admits, which is what a real implementation does for
                  the same reason, since a search over a random subset finds
                  rules very nearly as good for a fraction of the arithmetic.
                </p>
                <KeepInMind>
                  <p>
                    Nothing on this page was fitted on faces. A face detector is
                    this mechanism plus several thousand hand-marked faces, and
                    the corpus is the part that is missing rather than the idea,
                    so every number quoted here is measured on bands and clutter
                    and should be read as being about the mechanism.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="14. One reading, one threshold, one direction">
                <p>
                  The classifier the detector is built out of is the smallest
                  thing that can be called a classifier. Take one reading,
                  compare it against one number, and answer yes on one side of
                  that number. It is the same object as a single split in a
                  decision tree, written in the vocabulary of a window rather
                  than of a column of data.
                </p>
                <Equation>
                  {
                    "rule(window) = yes if reading(window) > threshold, otherwise no"
                  }
                </Equation>
                <p>
                  A rule like that is barely better than a coin, and it is meant
                  to be. On its own it separates almost nothing, since one
                  contrast in one place is weak evidence about anything. What
                  makes it useful is that it costs four lookups per cell to
                  evaluate, and that a great many of them can be combined.
                </p>
              </SubSection>

              <SubSection title="15. Boosting picks the rules and sets their voices">
                <p>
                  A stage is built by boosting. Give every training window a
                  weight, half the total spread across the targets and half
                  across the backgrounds; search every candidate reading and
                  every threshold for the rule with the smallest weighted error;
                  give that rule a voice worked out from how much better than
                  guessing it was; then multiply the weight of every window it
                  got wrong, so the next round is judged mostly on what the
                  first one failed at. Repeat for as many rounds as the stage is
                  allowed.
                </p>
                <Equation>
                  {"voice = ½ ln((1 − weighted error) / weighted error)"}
                </Equation>
                <p>
                  That expression is positive exactly when the rule is wrong on
                  less than half the weight, which for two classes is exactly
                  when the rule beats guessing, and it grows without bound as
                  the error falls to nothing. A rule that would earn a voice of
                  zero or less ends the stage instead of joining it, since a
                  rule no better than a coin drags the vote rather than
                  sharpening it.
                </p>
                <p>
                  The starting weights matter here in a way they do not for a
                  plain boosted classifier. By the third stage the surviving
                  backgrounds are a handful against every one of the fifty
                  targets, and weights spread evenly over the rows would let a
                  first rule score well simply by answering yes to everything.
                  Splitting the weight half and half between the two classes
                  stops that.
                </p>
              </SubSection>

              <SubSection title="16. A stage keeps every target it was shown, so it keeps backgrounds too">
                <p>
                  Now the part that makes a stage a stage rather than a
                  classifier. A boosted vote ordinarily accepts a window when
                  the rules that voted yes hold at least half the total voice. A
                  cascade stage is allowed to lower that demand, and only to
                  lower it, until the stage keeps every target it was trained
                  on. The reasoning is asymmetric on purpose. A background that
                  gets through only means the next stage has a little more to
                  look at, whereas a target that is dropped is gone, since no
                  later stage ever sees it.
                </p>
                <Equation>
                  {
                    "demand = min(½, the smallest share of the voice any training target attracted)"
                  }
                </Equation>
                <p>
                  The consequence is that no stage is any good on its own, and
                  that is the design rather than a shortfall. A filter tuned to
                  keep everything of one class necessarily keeps a good share of
                  the other. What a stage is for is to throw away some fraction
                  of what reaches it, cheaply, and the accuracy is supposed to
                  come from the fractions multiplying.
                </p>
                <KeepInMind>
                  <p>
                    On this fixture the lowering never actually bit. The least
                    confident training target attracted 0.5355 of the voice in
                    the first stage, 0.5121 in the second and all of it in the
                    third, so the plain half was already enough to keep all
                    fifty and the demand stayed at a half in every stage. The
                    mechanism matters when a stage is harder than these are, and
                    reporting that it did nothing here is more useful than
                    describing it as though it had.
                  </p>
                </KeepInMind>
              </SubSection>

              <SubSection title="17. What the fit found">
                <p>
                  Fitting on that set gave three stages holding five rules
                  between them, two in the first, two in the second and one in
                  the third. The first stage was handed all 2,000 backgrounds
                  and threw away 1,895 of them, which is 94.75 percent. The
                  second was handed the 105 that survived and threw away 102.
                  The third was handed 3 and threw away all 3, at which point
                  there was nothing left to fit a fourth stage on. All fifty
                  targets came through every stage.
                </p>
                <CascadeStageBoard />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Each rule is drawn where it reads, added cells in blue and
                  subtracted ones in red. Switch between a target and a
                  background and notice that the first stage&rsquo;s two rules
                  both straddle the middle rows, which is where the band is.
                </p>
                <p>
                  The shape of those numbers is what the method is named for.
                  Each stage is boosted on the backgrounds that survived the
                  ones before it, so each in turn faces a smaller and harder
                  problem and finds rules that are correspondingly more
                  particular. The first stage&rsquo;s two rules are cheap and
                  general; the third stage&rsquo;s single rule reads a pair of
                  two by two cells stacked against the right-hand edge of the
                  window, which is a question you would only ask of something
                  that had already got past two other stages.
                </p>
              </SubSection>

              <SubSection title="18. The same stages on windows it has never seen">
                <p>
                  Fitting numbers flatter, so here is a fresh draw of the same
                  fixture, 2,000 new backgrounds and 50 new targets, walked
                  through the same three stages. The backgrounds fall 2,000 to
                  117 to 3 to 1, and the targets fall 50 to 47 and then not at
                  all.
                </p>
                <HeldOutFunnel />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Read the two funnels together. The left one falls steeply,
                  which is what the cascade is for, while the right one stays
                  nearly flat, which is what the calibration bought.
                </p>
                <p>
                  The first stage on its own lets 117 of 2,000 fresh backgrounds
                  through where all three together let 1, which is the whole
                  argument for having three. The shares one stage passes to the
                  next are 0.0585, then 0.0256, then 0.3333, and multiplying
                  those three gives 0.0005, which is the 1 in 2,000 that arrives
                  at the end. Overall the fresh draw is scored at 0.998
                  accuracy, 0.94 recall and 0.9792 precision, and the recall is
                  the honest cost of the calibration, which keeps every target
                  it saw and promises nothing about a target it did not.
                </p>
                <KeepInMind>
                  <p>
                    Every fresh target that is lost is lost at the first stage.
                    That is not a coincidence of this fixture, it is the
                    structure, since a window rejected early is never offered to
                    anything later, so the earliest stages are where a
                    detector&rsquo;s misses are decided.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 5. The Ordering Is The Whole Method",
          content: (
            <>
              <SubSection title="19. Why the first stage decides the cost">
                <p>
                  Everything so far could have been assembled into a single
                  boosted classifier of five rules that runs all five on every
                  window. The cascade instead runs the first stage on every
                  window, the second only on what survived the first, and the
                  third only on what survived the second, so what a window costs
                  on average is each stage&rsquo;s rule count weighted by the
                  share of windows that reach it.
                </p>
                <Equation>
                  {
                    "rules per window = Σ over stages of (rules in the stage × share of windows reaching it)"
                  }
                </Equation>
                <p>
                  The first share is always one, since every window meets the
                  first stage, and the later shares are small if the earlier
                  stages are doing their job. So the total approaches the first
                  stage&rsquo;s own cost however many stages follow it, which is
                  why a detector of six thousand readings can end up costing
                  what a detector of ten costs. It is also why the stages have
                  to be in increasing order of expense, since the same three
                  stages in the opposite order would run the expensive one on
                  everything.
                </p>
              </SubSection>

              <SubSection title="20. The funnel, measured on a scene">
                <p>
                  Sweeping the fitted detector across the sixty-six pixel square
                  scene in the playground, one pixel at a time, 3,025 windows
                  enter the first stage, 235 reach the second and 137 reach the
                  third. That is 7.8 percent and 4.5 percent of the windows. The
                  cheap stage runs on everything and the later ones run on
                  almost nothing, and those three counts are what the whole
                  method comes to.
                </p>
                <WorkedExample>
                  <p>
                    Putting those shares into the expression above gives 2 times
                    1, plus 2 times 0.0777, plus 1 times 0.0453, which is 2.2007
                    rules per window. Counted directly, the sweep evaluated
                    6,657 rules over 3,025 windows, which is 2.2007 rules per
                    window. The two routes agree because they are the same sum
                    written twice.
                  </p>
                </WorkedExample>
                <p>
                  Broken out by stage, that is 6,050 evaluations in the first
                  stage, 470 in the second and 137 in the third, so 6,050 of the
                  6,657 readings taken, which is 91 percent of them, are the two
                  cheapest rules in the whole detector.
                </p>
              </SubSection>

              <SubSection title="21. The cost, four ways, and why one of the savings is small">
                <p>
                  There are several things the sweep could be compared against
                  and they give very different numbers, so it is worth setting
                  all four beside each other rather than quoting whichever is
                  most impressive.
                </p>
                <SweepCostComparison />
                <NumberTable
                  headings={[
                    "How the sweep could have been done",
                    "Rule readings",
                    "Times more",
                  ]}
                  rows={[
                    ["The cascade, in the order it stands", "6,657", "1"],
                    ["The same five rules at every position", "15,125", "2.27"],
                    [
                      "The 600 readings the fit searched, everywhere",
                      "1,815,000",
                      "272.6",
                    ],
                    [
                      "All 10,344 readings the window admits, everywhere",
                      "31,290,600",
                      "4,700.4",
                    ],
                  ]}
                  caption="One sweep of the same scene, counted four ways."
                />
                <p>
                  The second row is the honest comparison for the ordering
                  alone, holding the rules fixed, and it is only a factor of
                  2.27. That is worth saying plainly rather than hiding behind
                  the last row, because the saving from ordering is bounded by
                  how many rules there are to skip and this cascade has five of
                  them. A window rejected by the first stage skips at most three
                  rules. The published detector has thirty-eight stages and over
                  six thousand readings, and a window rejected by its first
                  stage skips essentially all of them, which is where the famous
                  numbers come from.
                </p>
                <p>
                  The last row is the comparison the method actually exists to
                  win. Answering &ldquo;is the band here&rdquo; by measuring
                  every reading the window admits, at every position, is
                  31,290,600 readings for this one small scene, and the cascade
                  spent 6,657. That ratio grows with the window, because the
                  count of readings grows faster than the area does.
                </p>
                <InAModel>
                  <p>
                    Two separate savings are stacked here and they are often
                    conflated. Boosting is what takes 10,344 candidate readings
                    down to five, and the ordering is what takes five rules a
                    window down to 2.2. The first is much the larger and it
                    happens once, at fitting time; the second is smaller and it
                    happens on every window forever.
                  </p>
                </InAModel>
              </SubSection>

              <SubSection title="22. What three stages still let through">
                <p>
                  Of the 3,025 windows, 111 survive all three stages, and all
                  three planted targets are among them. Twenty-eight of the 111
                  sit within two pixels of one of those targets, which is the
                  same target accepted several times over at neighbouring
                  offsets, and the other 83 are patches of ground that happen to
                  be brighter across their middle than above and below it.
                </p>
                <p>
                  That is what a three-stage cascade is, rather than a failure
                  of this one. Each stage keeps every target and therefore keeps
                  a fair share of the backgrounds, and the three shares of
                  0.0777, 0.583 and 0.810 multiply to 0.0367, which is small
                  without being anywhere near zero. The answer is more stages,
                  each multiplying the survival share down again, which is why
                  the published cascade has thirty-eight of them and not three.
                  A real detector also merges the clusters of overlapping
                  acceptances into one box per target, which nothing here does,
                  so the 28 near-misses would be reported as three finds and not
                  twenty-eight.
                </p>
                <KeepInMind>
                  <p>
                    The share of stages a window survived is sometimes handed
                    back as though it were a confidence. It orders windows
                    sensibly, in that a window rejected by the first of three
                    stages is further from being a target than one rejected by
                    the third, and it is not a probability of anything, because
                    no likelihood is computed anywhere in a sequence of hard
                    accept-or-reject decisions.
                  </p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. Where The Method Stops Being Defined",
          content: (
            <>
              <SubSection title="23. A signed reading says nothing about its mirror">
                <p>
                  Every reading in this family is signed. A layout that says
                  &ldquo;the added cells are brighter than the subtracted
                  ones&rdquo; answers a large positive number on that pattern
                  and a large negative number on the same pattern with bright
                  and dark exchanged, and a rule thresholding it in one
                  direction therefore rejects the exchanged pattern outright.
                  There is nothing gradual about it, and the method has no way
                  to express &ldquo;this contrast, either way round&rdquo;,
                  because the reading it is built from has a sign and the rule
                  it is built into has a direction.
                </p>
                <p>
                  Measured on fifty of the same targets with bright and dark
                  exchanged, the detector finds 0 of 50, where fresh upright
                  ones are found 43 of 50. Following one reading through says
                  why. The first rule&rsquo;s layout answers −7.1856 on one
                  target and 7.3344 on that same target relit, and the rule
                  votes yes when the reading is at or below −2.6449, so it votes
                  yes on the first and no on the second.
                </p>
                <PoseGallery />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  The three panels are the same fifty targets presented three
                  ways. The two zeros are exact rather than rounded.
                </p>
              </SubSection>

              <SubSection title="24. Nor does an upright layout say anything about a turned one">
                <p>
                  The same argument applies to orientation, by a different
                  route. The layouts are axis-aligned, and the layout of two
                  cells stacked and the layout of two cells side by side are
                  different members of the family, so a rule that reads one of
                  them has nothing at all to say about the other. Turning the
                  target a quarter does not weaken the evidence the fitted rules
                  read; it moves the evidence into readings those rules never
                  look at. The measurement is 0 of 50 again, on the same fifty
                  targets with the band running down instead of across.
                </p>
                <p>
                  This is a fact about the family of readings rather than about
                  any fit, and it is why real implementations fit one cascade
                  per pose and run several of them. That is an honest statement
                  about how little the method generalises, since a description
                  that needs a separate fitted model for every orientation is
                  not describing orientation at all.
                </p>
              </SubSection>

              <SubSection title="25. A scene that is mostly target is not fast">
                <p>
                  The cost expression in step 19 says the speed comes from the
                  shares of windows reaching the later stages being small, and
                  those shares are a property of the scene rather than of the
                  detector. On a scene in which most windows are the thing being
                  looked for, almost nothing is rejected early and the ordering
                  buys almost nothing.
                </p>
                <SceneCostComparison />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  The same detector, the same ground, and the only difference is
                  how much of each scene is target. Watch the average cost climb
                  towards the ceiling of five rules a window.
                </p>
                <p>
                  Measured, a window costs 2.1597 rules on ground with no target
                  in it, 2.2007 on the scene with three planted, and 2.6552 when
                  the ground is tiled edge to edge with them, while the saving
                  over running the same five rules everywhere falls from 2.315
                  to 1.883. The ceiling is five rules a window and a saving of
                  exactly one, which is what a scene entirely made of targets
                  would cost, and at that point the flat classifier is the
                  better arrangement because it does the same work without the
                  per-window bookkeeping of deciding whether to continue. This
                  is the only regime measured on this page where the obvious
                  alternative wins.
                </p>
              </SubSection>

              <SubSection title="26. What is learned is a fact about contrast">
                <p>
                  It is tempting to say the detector has learned what a band
                  looks like. What it has learned is that certain rectangles of
                  the window tend to be brighter than certain neighbouring ones,
                  and that is a statement about contrast and not about an
                  object. Anything with the same coarse pattern of contrast
                  satisfies it, which is exactly what the 83 windows of plain
                  clutter accepted in step 22 are.
                </p>
                <p>
                  This is the limit that no amount of extra training moves,
                  because it is in the vocabulary rather than in the fit. The
                  readings can express &ldquo;brighter here than there&rdquo; at
                  every position and size, and they cannot express anything
                  else, so any two things that agree on every rectangle contrast
                  are indistinguishable to any cascade built from them however
                  many stages it has. What extra training buys is a longer list
                  of contrasts to check, which shrinks the set of things that
                  pass without ever changing the kind of fact being checked.
                </p>
              </SubSection>

              <SubSection title="27. The cases the definition does not reach">
                <p>
                  Finally, the inputs on which there is no answer to give, or on
                  which the answer is a decision rather than a consequence.
                  These are facts about the method and not about any particular
                  program, and where there is a genuine choice it is worth
                  knowing what turns on it.
                </p>
                <DerivationTable
                  expressionHeading="The case"
                  reasonHeading="What is undefined, or what has to be decided"
                  rows={[
                    {
                      expression: "A window one pixel square",
                      reason:
                        "The smallest layout needs two cells, so it needs at least two pixels on one side. A one by one window admits 0 readings, so the set the fit searches is empty and there is nothing to threshold. Two pixels square admits 7.",
                    },
                    {
                      expression: "No reading separates the two classes",
                      reason:
                        "Every candidate is wrong on at least half the weight, so every voice is zero or less and no first rule can be admitted. A cascade of no stages accepts every window it is shown, which is not a detector, so the honest answer is to refuse rather than to return one.",
                    },
                    {
                      expression: "A reading exactly equal to a threshold",
                      reason:
                        "The threshold is chosen at the midpoint of two adjacent training values, so an equal value is a genuine tie and a choice. It has to be made once and applied everywhere, because the same value reached by two routes can differ in its last bit, which is the 2.2e−16 measured in step 12.",
                    },
                    {
                      expression: "A stage that rejects nothing",
                      reason:
                        "It was handed the same problem its predecessor was, so every later stage would be a copy of it and the cascade has stopped falling away. Continuing adds cost to every window and rejects nothing, so there is nothing to be gained by fitting more. The other way a fit runs out is the one that happened here, where the third stage rejected the last 3 training backgrounds and left a fourth stage nothing to be fitted against, so 3 stages were kept of the 5 allowed.",
                    },
                    {
                      expression: "Keeping every target, on unseen targets",
                      reason:
                        "The calibration is over the training targets, so it says nothing about a target it has not seen. Measured on a fresh draw, recall falls from 1.00 to 0.94, and all three losses happen at the first stage.",
                    },
                    {
                      expression: "A target at a different size",
                      reason:
                        "A reading is fixed to a cell size, so a band twice as wide is a different reading. Nothing in the method extends across scale by itself; the table makes it cheap to scale the readings rather than the picture, and the scales still have to be searched one at a time.",
                    },
                  ]}
                />
                <p>
                  The last of those is the one most often glossed over, and it
                  is worth being precise about what the table does and does not
                  buy. Because a rectangle total costs four lookups whatever the
                  size of the rectangle, growing every cell of a reading by a
                  factor costs nothing extra, so searching several sizes costs
                  the same per size rather than more for the large ones. What it
                  does not do is remove the need to search them.
                </p>
              </SubSection>
            </>
          ),
        },
      ]}
    />
  );
}
