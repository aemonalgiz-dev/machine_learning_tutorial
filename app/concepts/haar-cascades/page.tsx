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
  title: "Haar Cascades · Perceptron Lab",
  description:
    "Most regions searched by an object detector contain no match. A cascade rejects unlikely regions with inexpensive checks before spending more computation on the candidates that remain.",
};

const link =
  "font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400";

export default function HaarCascadesPage() {
  return (
    <ConceptPage
      lessonId="haar-cascades"
      intuition={lessonIntuitions["haar-cascades"]}
      technicalStart="Part 2. A Table Where Every Entry Is A Running Total"
      openingTitle="Discard the Easy Negatives First"
      playgroundTitle="Find light and dark arrangements with rectangle sums"
      playgroundIntro="Follow which windows survive each stage. Compare the total feature calculations with the detections retained, rather than looking at speed alone."
      title="Haar Cascades"
      tagline={"Most regions searched by an object detector contain no match. A cascade rejects unlikely regions with inexpensive checks before spending more computation on the candidates that remain."}
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

      playground={
        <div>
          <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            One sweep, stage by stage
          </h2>
          <p>The detector searches for a bright band in a larger scene. It checks a small window at many positions and rejects unlikely positions in stages. Choose a stage above to see which windows remain when that stage begins. We will first calculate what a window measures, then see how the staged decisions reduce the search.</p>
          <CascadeSweepBoard />
        </div>
      }
      sections={[
        {
          title: "Part 1. What A Search Costs Before Any Of This",
          defaultOpen: true,
          content: (<>
<>
              <SubSection title="1. Looking for something means asking everywhere">
                <>
<p>
                  Suppose we are looking for a bright band in a twelve-pixel-square
                  patch. The band could appear at many locations in a larger
                  picture. A straightforward baseline slides that window one
                  pixel at a time and checks every position where it fits.
                </p>
                <p>
                  A scene sixty-six pixels square holds 3,025 such positions, and that number is fixed before we have decided anything at all about how the question is answered.
                </p>
</>
                <p>The search already requires thousands of window checks on this small scene. A larger photograph, searched at several object sizes, requires more. If every window receives the same expensive calculation, most of that work may be spent on obvious background.</p>
              <p>Our aim is to reject clear background cheaply and reserve later checks for the few windows that remain plausible. We still need to measure how many real targets those early decisions discard. Speed is useful only alongside an acceptable detection error.</p>
                <KeepInMind>
                  <p>For this one-pixel-stride scan, image size and window size determine the 3,025 positions. We will hold that search fixed while reducing the work at each position. Changing the stride, scale range or proposal method would change the number of windows too.</p>
                </KeepInMind>
              </SubSection>

              <SubSection title="2. And every question is a sum over a rectangle">
                <>
<p>We want to compare regions inside a window, such as its middle rows against the rows above and below. Directly summing those regions repeats work for many overlapping windows. Larger rectangles require more pixel additions each time, making an otherwise simple contrast test expensive.</p>
                <p>A large region can average over small fluctuations, so avoiding large regions merely to save arithmetic would limit the measurements available. We need a way to reuse sums across rectangle queries.</p>
</>
                <p>
                  On the six timing runs here, directly summing a 600-by-600 image took between 107 and 130 times as long as summing a one-pixel box, with two thousand repetitions per measurement. The full image contains 360,000 pixels. Vectorized arithmetic makes the runtime ratio much smaller than the pixel-count ratio, but the larger sum still takes substantially more work.
                </p>
                <InAModel>
                  <p>There are two costs to reduce: how many features each window evaluates, and how much each feature costs. Evaluating thousands of rectangle features at thousands of positions multiplies those costs. We will count the operations for this scene before comparing the savings from reusable sums, feature selection and early rejection.</p>
                </InAModel>
              </SubSection>

              <SubSection title="3. What the method is, before any of its parts">
                <>
<p>The Viola–Jones approach combines reusable rectangle sums with simple contrast measurements and staged rejection. Begin with the sums: a precomputed table lets any axis-aligned rectangle be read using four lookups, independent of its area.</p>
                <p>Haar-like features combine those rectangle sums, adding some regions and subtracting others. A learned threshold turns a feature value into a simple decision. Groups of decisions form stages, and a window rejected by one stage skips every later stage.</p>
</>
                <p>The components solve different cost problems. Precomputed sums make each candidate feature cheaper. Feature selection limits how many tests are retained. Staging avoids running the full retained set on every background window. We can measure those savings separately.</p>
              </SubSection>
            </>
</>),
        },
        {
          title: "Part 2. A Table Where Every Entry Is A Running Total",
          content: (
            <>
              <SubSection title="4. Every entry is everything above and to the left">
                <p>A summed-area table stores cumulative pixel totals in two dimensions. Each entry includes the image values above and to its left, including the corresponding pixel. Previously computed neighbors supply the total in a single pass. The next expression corrects for the overlap between those neighbors.</p>
                <Equation>
                  {
                    "table[r, c] = picture[r, c] + table[r−1, c] + table[r, c−1] − table[r−1, c−1]"
                  }
                </Equation>
                <>
<p>
                  The last term is there because the region above and the region to the left overlap in the whole corner above and to the left of both, so that corner would otherwise be counted twice. In practice the table is built one row and one column larger than the picture, with that extra first row and column holding zeros, which is not padding for its own sake.
                </p>
                <p>
                  It is what lets a box touching the top edge be read by the same expression as a box in the middle, rather than by three special cases for the boxes whose first row or first column is zero.
                </p>
</>
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
                <p>The rectangle query needs four table reads and three combining operations, irrespective of its area. The widget first uses the image pattern 10r + c so the selected sums are straightforward to check by hand, then offers the shared workbench scene. That pattern helps inspect the arithmetic; it does not guarantee that every different rectangle has a different total.</p>
                <WorkedExample>
                  <>
                    <p>
                      Take the three-by-three box starting at row one, column two. The
                      integral image gives four corner entries: 340 at the bottom-right,
                      10 at the top-right, 124 at the bottom-left and 1 at the top-left.
                    </p>
                    <Equation>{"box sum = bottom-right − top-right − bottom-left + top-left\n        = 340 − 10 − 124 + 1\n        = 207"}</Equation>
                    <p>
                      Each of the four entries is itself a total, of everything
                      above and to the left of one corner of the box.
                    </p>
                    <NumberTable
                      headings={["entry", "what it is the total of", "value"]}
                      rows={[
                        ["bottom-right", "rows 0 to 3, columns 0 to 4", "340"],
                        ["top-right", "row 0, columns 0 to 4", "10"],
                        ["bottom-left", "rows 0 to 3, columns 0 to 1", "124"],
                        ["top-left", "row 0, columns 0 to 1", "1"],
                      ]}
                    />
                    <p>
                      Adding its nine pixels directly gives the same answer.
                    </p>
                    <Equation>{"(12 + 13 + 14) + (22 + 23 + 24) + (32 + 33 + 34) = 39 + 69 + 99 = 207"}</Equation>
                    <p>
                      Across all 588 boxes in this six-by-seven picture, the two
                      methods agree exactly.
                    </p>
                  </>
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
                  Once the summed-area table exists, a rectangle query reads four entries whether the rectangle contains one pixel or 360,000. The number of lookups no longer grows with rectangle area. Building the table still has a cost, so we will account for that before deciding when it helps.
                </p>
                <p>Across six timing runs on the six-hundred-pixel-square image, the summed-area query for the whole image took between 1.01 and 1.11 times as long as the one-pixel query. Direct summation took between 107 and 130 times as long. Both summed-area queries use four lookups. Cache behavior, timing overhead and other runtime effects can still vary; these measurements do not isolate one cause for the small difference.</p>
                <ReadingCostPanel />
                <p className="text-sm text-slate-600 dark:text-slate-400">These timings are measured on the API server and cached for that process. A new process or machine can produce different times. The lookup counts do not depend on those timings.</p>
              </SubSection>

              <SubSection title="7. What the table costs before it saves anything">
                <p>Building the table requires a pass over the image and storage slightly larger than the image itself. In these measurements, construction took about 6,900 microseconds, one whole-image table query about 1.4, and direct whole-image summation about 171. For repeated whole-image queries, construction is recovered after roughly forty reads. Smaller rectangle queries can have a different break-even point because direct summation has less work to do.</p>
                <p>The detector searches 3,025 windows with several rectangle queries at each. That makes reuse promising, but we cannot apply the forty-query whole-image crossover directly: its individual feature rectangles are much smaller than the image. A timing comparison for this detector should include table construction and its actual query sizes.</p>
                <KeepInMind>
                  <p>The table moves work from each query into a shared preparation step. Building it requires a pass over the image; later rectangles use four lookups. Whether that preparation pays off depends on how many rectangles we will ask about.</p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 1 and 2",
          quiz: [
            choice(
              "Reading a box off the table takes the entry at its bottom-right corner, subtracts the entries at the top-right and the bottom-left, and adds the entry at the top-left. Why is that one added back?",
              [
                "The region above and to the left of the box was taken away twice, once with each strip",
                "The border of zeros has to be undone before the total is right",
                "The box’s own top-left pixel was never counted in the first place",
                "Four signs have to cancel for the read to cost the same at every size",
              ],
              0,
              "Each subtraction removes a strip plus the shared upper-left region. That shared region has been subtracted twice and must be added back once. For the supplied rectangle:\n\n```math\nrectangle sum = 340 − 10 − 124 + 1 = 207\n```\n\nThe direct sum of its nine pixels gives the same result.",
            ),
            choice(
              "Read off the table of running totals, how does a box of 360,000 pixels compare with a box of one pixel?",
              [
                "Between 1.01 and 1.11 times as long, since both name four table entries",
                "Between 107 and 130 times as long",
                "Exactly the same, to the last microsecond",
                "Four times as long, one lookup per corner",
              ],
              0,
              "Both rectangle sums use four integral-image lookups after the table has been built. The measured lookup times are close, while directly summing more pixels takes substantially longer. Memory access and measurement overhead can produce small timing differences, so constant operation count does not mean identical elapsed time.",
            ),
            trueFalse(
              "The table costs nothing, so there is never a reason not to build it.",
              false,
              "Building the integral image requires one pass and an additional array. For the recorded benchmark, building took about 6,900 microseconds, a table lookup about 1.4 and a direct full-image sum about 171. Repeated large rectangle sums can repay that setup cost, while one small query may not. The break-even point depends on image size, rectangle sizes and implementation.",
            ),
            choice(
              "Why is the table built one row and one column larger than the picture, with zeros in the extra row and column?",
              [
                "So a box touching the top edge is read by the same expression as a box in the middle",
                "So the running totals cannot overflow near the corners",
                "So the four corner lookups never name the same entry twice",
                "So one table can serve several window sizes",
              ],
              0,
              "Without it the boxes whose first row or first column is zero would need three special cases of their own. Drag the box into the top-left corner and two of the four lit entries fall into the border of zeros while the expression is unchanged.",
            ),
            several(
              "The detector is three separable ideas. Which of these are among them?",
              [
                "A table of running totals, so a rectangle’s sum costs four lookups whatever its size",
                "A family of crude readings, each the total over some bright cells less the total over some dark ones",
                "An ordering, in which a window that fails a stage is dropped without the later stages ever seeing it",
                "A normalizing step, which rescales every window to the same brightness before it is read",
              ],
              [0, 1, 2],
              "The readings are only affordable given the table, and the ordering only becomes necessary once the readings a window offers have been counted. The method is named for the ordering, the cascade, and each of the three is worth having on its own. Normalizing each window is what the original paper adds on top, and nothing on this page does it.",
            ),
        ],
        },
        {
          title: "Part 3. What The Detector Actually Reads",
          content: (
            <>
              <SubSection title="8. Bright cells minus dark ones">
                <>
<p>After constructing the summed-area table, feature evaluation can read rectangle totals instead of summing the underlying pixels again. Each feature adds some neighboring rectangle sums and subtracts others. The result measures a particular arrangement of brightness differences within the window.</p>
                <p>With equal total area added and subtracted, a uniform brightness offset cancels. Multiplying brightness still scales the feature response. Some layouts here have unequal added and subtracted areas, so even an offset changes them. We will check these lighting effects rather than assuming every rectangle contrast is invariant.</p>
</>
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

              <SubSection title="9. Compare five rectangle features on small images" id="9-five-layouts-worked-on-pictures-small-enough-to-count">
                <>
<p>

                  The five layouts shown here compare different neighboring regions. Two side-by-side rectangles respond to a vertical contrast; two stacked rectangles respond to a horizontal contrast. Three rectangles in a row or column compare the middle with both sides, making them useful for a strip or band. We can inspect their responses on a four-by-four image.
                </p>
                <p>The checkerboard layout compares one diagonal pair of cells with the other. On an ideal alternating checkerboard, that contrast can be strong while the side-by-side and stacked two-cell sums cancel.</p>
</>
                <ArrangementGallery />
                <WorkedExample>
                  <>
<p>
                    On a four by four picture whose top two rows are one and whose bottom two are zero, two cells stacked answer eight, since eight ones sit above and eight zeros below. The same layout turned, two cells side by side, answers exactly zero on the same picture, because each cell holds two bright rows and two dark ones and they cancel.
                  </p>
                  <p>
                    Three cells in a column over one bright row between two dark ones answer two, and over two bright rows out of four they answer zero, because the band and one flank now hold the same amount of light.
                  </p>
</>
                </WorkedExample>
                <KeepInMind>
                  <p>A large feature response identifies a particular contrast pattern. The same contrast can occur in a target or in background. Labeled examples are needed to choose whether that response is useful evidence and where to place its decision threshold.</p>
                </KeepInMind>
              </SubSection>

              <SubSection title="10. Two of the five read the lamp as well as the picture">
                <p>A constant brightness offset cancels only if the total added and subtracted areas balance. The two-cell and checkerboard layouts do balance. The three-cell layouts in this implementation add the middle cell and subtract both flanks, with equal-sized cells. Their total signed area is therefore nonzero.</p>
                <>
<p>On a flat image with one-pixel cells, the balanced layouts give 0.0 at brightness 0.25 and at brightness 0.9. The three-cell layouts give −0.25 and −0.9 respectively. Their responses therefore change even though the image still has no internal contrast.</p>
                <p>The published Viola–Jones detector normalizes window variance to reduce lighting effects. This teaching implementation omits that preparation. Variance scaling alone would not remove an additive offset from an unbalanced feature: that needs mean correction or balanced weights as well. Keep the preprocessing and rectangle weights in mind when interpreting lighting sensitivity.</p>
</>
                <WhyThisWorks title="Which rectangle layouts cancel a constant brightness offset?">
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
                  <p>The two-cell and checkerboard signs sum to zero, so any constant brightness gives zero response. The three-cell signs sum to −1, leaving a negative response proportional to the cell area and brightness. The measured response is −0.9 when each cell has one pixel at brightness 0.9.</p>
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
                <WorkedExample title="A window two pixels square, counted by hand">
                  <p>
                    Two cells side by side are two cells wide, so in a window
                    two pixels wide each cell can only be one pixel wide. It
                    can be one pixel tall or two.
                  </p>
                  <Equation>{"cells 1 tall, 1 wide   (2 − 1 + 1) × (2 − 2 + 1)  =  2 positions\ncells 2 tall, 1 wide   (2 − 2 + 1) × (2 − 2 + 1)  =  1 position\n\ntwo cells side by side  =  2 + 1  =  3 readings"}</Equation>
                  <p>
                    Two cells stacked give 3 by the same count turned on its
                    side. Neither three-cell layout fits, since each needs
                    three pixels in one direction. The chequer fits once, with
                    one-pixel cells.
                  </p>
                  <Equation>{"3 + 3 + 0 + 0 + 1 = 7 readings, on 4 pixels"}</Equation>
                </WorkedExample>
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
                <>
                  <p>
                    A twenty-four-by-twenty-four window has far more candidate Haar
                    features than pixels. The counts grow rapidly as the window grows.
                  </p>
                  <Equation>{"pixels = 24 × 24 = 576\nfeatures per pixel = 162,336 / 576 ≈ 281.83"}</Equation>
                  <p>
                    Even the small playground scene would be expensive if every feature
                    were evaluated at every window position.
                  </p>
                  <Equation>{"exhaustive evaluations = 3,025 windows × 10,344 features\n                       = 31,290,600"}</Equation>
                  <p>
                    The later stages select a small subset of useful features and reject
                    many windows early.
                  </p>
                </>
                <FeatureCountCurve />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Both counts are drawn on a scale where each step up is a
                  factor of ten. Look at the gap between the two lines opening
                  as the window grows.
                </p>
              </SubSection>

              <SubSection title="12. Two ways of adding four numbers, and the last bit">
                <p>A feature combines several rectangle sums. Adding them sequentially and using Python&rsquo;s built-in summation can round differently. Python 3.12 changed floating-point summation to improve accuracy on most builds. Even a tiny difference can matter when a threshold lies at the boundary between the two computed values.</p>
                <>
<p>In the recorded comparison of 200 feature values from five pictures, one differed between the two summation routes by 2.2 times ten to the minus sixteen. The built-in sum gave −0.8391149931171449 and sequential addition gave −0.8391149931171447. The next check deliberately places a threshold at the first value to show how rounding can change a boundary decision; it is not how every fitted threshold is chosen.</p>
                <p>With that threshold and a strict greater-than comparison, the sequential result passes and the built-in-sum result does not. The issue is consistency between fitting and evaluation, not that a more accurate sum is inherently wrong. This SDK uses sequential cell addition in both paths so its selected thresholds are applied to values calculated the same way.</p>
</>
                <KeepInMind>
                  <p>Values close to a decision threshold can switch sides after a small rounding change. Use a consistent calculation and document whether equality passes. If decisions need a tolerance or margin around the threshold, that must be an explicit policy too.</p>
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
                <>
<p>

                  This detector learns its tests from examples, so we need labeled target and background patches. Our target is a bright band four rows deep across the middle of a twelve-by-twelve window. We move it one row up or down between examples, place it on a cluttered background, and add a little speckle.
                </p>
                <p>The background examples contain clutter without a band. The clutter varies in three-by-three blocks rather than independently at every pixel. That creates larger bright and dark regions that can resemble the target&rsquo;s rectangle features. Independent pixel noise would average down more strongly inside the larger rectangle sums, making this particular classification problem easier.</p>
</>
                <p>This fixture has 50 targets and 2,000 backgrounds, reflecting a setting where most scanned windows do not contain the target. The teaching fit samples 600 candidate features from the available 10,344 to limit its search work. That is an implementation choice here, rather than a guarantee that random sampling finds nearly the best features or describes every deployed cascade trainer.</p>
                <KeepInMind>
                  <p>The training examples here contain bands and clutter, not faces. They let us inspect rectangle features, boosting and staged rejection on a small problem. A useful face detector additionally needs suitable labeled data and the complete preparation and scanning procedures used by its implementation. These measurements should therefore be interpreted as results for this band detector.</p>
                </KeepInMind>
              </SubSection>

              <SubSection title="14. One reading, one threshold, one direction">
                <p>A weak classifier compares one feature response with one threshold and predicts target on a chosen side. This is a one-question decision tree applied to an image-derived measurement. Its simplicity makes it cheap, but also limits how much it can distinguish on its own.</p>
                <Equation>
                  {
                    "rule(window) = yes if reading(window) > threshold, otherwise no"
                  }
                </Equation>
                <p>A decision using one contrast measurement can be limited because backgrounds may share that contrast. Its error need not be only slightly better than guessing; usefulness depends on the training distribution and selected feature. The attraction is that the rectangle measurement is cheap and can contribute to a combined decision with other tests.</p>
              </SubSection>

              <SubSection title="15. Boosting picks the rules and sets their voices">
                <p>Boosting builds a stage one rule at a time. Initially, the targets share half the total training weight and the backgrounds share the other half. Search the sampled candidate features and their thresholds for the lowest weighted error. Assign the chosen rule a vote weight, called its voice in the displayed formula. Increase the relative training weights of misclassified windows and reduce those of correctly classified windows before selecting another rule.</p>
                <Equation>
                  {"voice = ½ ln((1 − weighted error) / weighted error)"}
                </Equation>
                <p>The rule&rsquo;s vote weight is positive when its weighted error is below one half. The formula grows without bound as error approaches zero; the implementation caps the limiting case. This trainer stops adding rules if the best candidate earns effectively zero weight. A zero-weight rule would not change the vote, while a negatively weighted rule would need a different treatment, such as reversing its predictions.</p>
                <p>Class balancing matters because later stages see only the backgrounds that survived earlier tests. In this run, they eventually face very few backgrounds alongside all fifty training targets. Equal weight per row could then reward a rule that accepts everything. Giving each class half the initial total weight prevents that majority-class shortcut. The same issue can arise in other boosted classifiers too.</p>
              </SubSection>

              <SubSection title="16. A stage keeps every target it was shown, so it keeps backgrounds too">
                <>
<p>A stage combines its selected rules into a weighted vote. In this implementation, its threshold may be lowered from the ordinary half-vote threshold until all training targets survive. That chooses retention over immediate background rejection. It is the policy used by this fit, rather than a requirement that every cascade retain every target or use only that threshold adjustment.</p>
                <p>Errors have different consequences within a cascade. A background window that passes creates work for the next stage. A true target rejected now cannot be recovered later. Early thresholds therefore favor retaining targets while still rejecting enough background to save work.</p>
</>
                <Equation>
                  {
                    "demand = min(½, the smallest share of the voice any training target attracted)"
                  }
                </Equation>
                <p>A stage can deliberately accept many backgrounds in order to retain most targets. Later stages apply more tests to the survivors. The useful balance is high target retention together with sufficient early rejection; an individual stage need not be a strong complete detector.</p>
                <WorkedExample title="The shares a two-rule stage can give">
                  <p>A window&rsquo;s vote-weight share is the total weight of rules predicting yes divided by the stage&rsquo;s total rule weight. The first stage in step 17 has two rules with weights 1.8067 and 1.5669. Their yes/no combinations produce four possible shares.</p>
                  <Equation>{"total voice  ≈  3.3737\n\nonly the louder rule says yes    1.8067 / 3.3737  ≈  0.5355\nonly the quieter rule says yes   1.5669 / 3.3737  ≈  0.4645\nboth say yes                     1\nneither says yes                 0"}</Equation>
                  <p>At a half-vote threshold, the louder of these two rules determines the outcome on the 2,050 training windows. Lowering the threshold to 0.4645 allows either rule to pass a window by itself. The change illustrates how a discrete set of weighted votes can alter retention abruptly, rather than supplying a continuously graded resemblance score.</p>
                </WorkedExample>
                <KeepInMind>
                  <p>No stage needs its acceptance threshold lowered in this training run. The least-supported positive window receives vote-weight shares 0.5355, 0.5121 and 1.0 in the three stages, all above the initial threshold of one half.</p>
<p>In stage one, two targets are accepted by only the heavier rule, whose weight is 1.8067. Stage two has rule weights 2.1171 and 2.0171; its least-supported target is likewise accepted by only the heavier rule. The reported minimum shares explain why every training target passes without activating the threshold adjustment. That adjustment may matter in a different fit.</p>
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
                <p>Later stages are trained on the backgrounds that passed the earlier stages. Those surviving examples can require different features to reject. Here the third stage uses one feature made of stacked two-by-two cells near the window&rsquo;s right edge. Its role comes from its effect on the remaining examples, not from a general rule that later features must be smaller or more specialized.</p>
              </SubSection>

              <SubSection title="18. The same stages on windows it has never seen">
                <p>Now test the fitted cascade on a fresh draw from the same generator: 2,000 backgrounds and 50 targets. The background counts fall from 2,000 to 117, then 3, then 1. The target count falls to 47 after the first stage and stays at 47. These windows were not used to select the fitted rules.</p>
                <HeldOutFunnel />
                <p className="text-sm text-slate-600 dark:text-slate-400">Compare both funnels. Background windows are rejected rapidly, while 47 of the 50 targets survive. No acceptance-threshold adjustment was needed in this training run, so the result should not be attributed to an adjustment that never occurred.</p>
                <>
<p>The first stage accepts 117 of the 2,000 fresh backgrounds; the complete cascade accepts one. Each later stage checks only the survivors. Multiplying their conditional survival fractions gives the overall survival fraction shown by the funnel.</p>
                <p>
                  On the fresh sample, accuracy is 0.998, recall is 0.94 and precision is 0.9792. The recall shows that some new targets were missed, even though calibration kept every target it was shown. Keeping the calibration targets does not guarantee that every later target will pass.
                </p>
</>
                <p>
                  All three scores come from the two ends of the funnels. Of
                  the 50 fresh targets 47 are accepted, and of the 2,000 fresh
                  backgrounds 1 is accepted and 1,999 are turned away.
                </p>
                <Equation>{"recall     =  47 / 50                  =  0.94\nprecision  =  47 / (47 + 1)            ≈  0.9792\naccuracy   =  (47 + 1,999) / 2,050     ≈  0.998"}</Equation>
                <p>
                  The accuracy is the least informative of the three here. A
                  detector that turned every window away would score 2,000 out
                  of 2,050 on the same draw, because the backgrounds outnumber
                  the targets forty to one.
                </p>
                <KeepInMind>
                  <p>On this fresh sample, all missed targets were rejected at the first stage. That is a measured result for this fit, rather than a requirement of cascades. Any stage can lose a target, and once it does, no later stage sees that window. Target retention must therefore be checked through the entire cascade.</p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 3 and 4",
          quiz: [
            choice(
              "On a picture of uniform brightness, which of the five layouts answer zero?",
              [
                "The two two-cell layouts and the chequer, whose cell signs add to zero",
                "All five, which is the property the family was chosen for",
                "Only the chequer, since it is the only one with a diagonal",
                "The two three-cell layouts, which set one cell against two",
              ],
              0,
              "The two-cell and checkerboard layouts have equal signed areas and cancel uniform brightness. The alternating three-cell layouts used here have net negative area, so their response changes even on a flat image. Dividing by window standard deviation alone would not cancel an additive brightness offset in an unbalanced feature; a mean correction or balanced weighting is also needed for that invariance. This teaching implementation does not perform those corrections.",
            ),
            trueFalse(
              "The first fitted stage threw away 1,895 of the 2,000 training backgrounds, and the second stage was then fitted against only the 105 that survived.",
              true,
              "Each stage is boosted on the backgrounds that got past the ones before it, so each in turn faces a smaller and harder problem. The second threw away 102 of its 105 and the third threw away the last 3, which left a fourth stage nothing to be fitted against. All fifty targets came through every stage.",
            ),
            choice(
              "On a fresh draw of 50 targets and 2,000 backgrounds the detector scores 0.94 recall and 0.9792 precision. What are those two numbers made of?",
              [
                "47 of the 50 targets were accepted, and 1 background was accepted beside them",
                "47 of the 50 targets were accepted, and 3 backgrounds were accepted beside them",
                "All 50 targets were accepted, and 117 backgrounds were accepted beside them",
                "47 of the 50 targets were accepted, and no background was",
              ],
              0,
              "Forty-seven targets pass and one background passes, giving:\n\n```math\nrecall = 47 / 50 = 0.94\nprecision = 47 / (47 + 1) ≈ 0.9792\n```\n\nThe 117 backgrounds reaching stage two and three reaching stage three are intermediate counts, not final false positives.",
            ),
            choice(
              "Two ways of totaling a reading’s cells disagreed on one of 200 readings, by 2.2 times ten to the minus sixteen. Why does that matter here?",
              [
                "A stage’s threshold is chosen to sit exactly on one of these values, which quietly makes an equality test out of what looks like an inequality",
                "The arithmetic off the table is fragile, so the error accumulates across cells",
                "A reading’s sign is decided by its last bit",
                "Boosting multiplies the weights, so a small difference grows round by round",
              ],
              0,
              "A threshold placed exactly on a training response makes the result sensitive to which rounded representation is compared with it. Algebraically equivalent summation orders can differ by a few floating-point bits. Training and prediction should therefore use a consistent response convention and a documented threshold/tie policy. A more accurate individual sum is not mathematically wrong; it can simply differ from the value used to choose the existing threshold.",
            ),
            several(
              "Which of these hold for a cascade stage as it is fitted here?",
              [
                "The demand on the vote may only be lowered, as far as the smallest share of the voice any training target attracted",
                "A rule that would earn a voice of zero or less ends the stage rather than joining it",
                "Half the starting weight goes to the targets and half to the backgrounds",
                "On this fixture the plain half was already enough to keep all fifty training targets",
              ],
              [0, 1, 2, 3],
              "All four hold. The lowering never actually bit here, since the least confident training target attracted 0.5355 of the voice in the first stage, 0.5121 in the second and all of it in the third. The 0.5355 is the louder rule’s 1.8067 out of a total voice of 3.3737, a target that only that rule recognized. The reasoning behind the lowering is asymmetric on purpose, because a background that gets through only gives the next stage more to look at where a dropped target is gone for good.",
            ),
        ],
        },
        {
          title: "Part 5. Feature Evaluation and Early Rejection",
      id: "part-5-the-ordering-is-the-whole-method",
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
                <p>The first stage is evaluated for every window, so its cost always contributes. Later costs are multiplied by the fractions that reach them. If early stages reject most backgrounds, a large cascade can therefore evaluate relatively few features per window on average. The useful ordering depends on rejection gained per unit of work; stages do not have to increase in expense. This example actually has two rules, then two, then one.</p>
              </SubSection>

              <SubSection title="20. The funnel, measured on a scene">
                <p>In the playground scene, 3,025 windows reach the first stage, 235 reach the second and 137 reach the third. The later counts are 7.8 percent and 4.5 percent of the original search. These shares let us calculate how much feature evaluation the early exits avoid.</p>
                <WorkedExample>
                  <>
                    <p>
                      Weight each stage’s rule count by the fraction of windows reaching
                      it. This gives the average number of rules evaluated per window.
                    </p>
                    <Equation>{"expected rules ≈ 2 × 1 + 2 × 0.0777 + 1 × 0.0453 ≈ 2.2007\nmeasured rules = 6,657 / 3,025 ≈ 2.2007"}</Equation>
                    <p>
                      Both calculations describe the same work. The stage shares are
                      rounded in the displayed expression.
                    </p>
                  </>
                </WorkedExample>
                <p>The first stage performs 6,050 feature evaluations, the second 470 and the third 137. Thus about 91 percent of the 6,657 evaluations belong to the first stage. Its two rules are the most frequently used, which is why making early tests inexpensive matters.</p>
              </SubSection>

              <SubSection title="21. The cost, four ways, and why one of the savings is small">
                <p>
                  Let&apos;s compare all four alternatives on the same search. Their costs include different amounts of work, so quoting one ratio without naming the baseline would make the speed claim difficult to interpret.
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
                <>
<p>Comparing the first two rows holds the five selected rules fixed and asks how many evaluations early rejection avoids. The reduction is a factor of 2.27 here. The later rows also change how many candidate features are evaluated, so their larger reductions include feature selection as well. These are evaluation counts, not measured runtime ratios or comparisons of classifier accuracy.</p>
                <p>
                  A window rejected by the first stage skips at most three rules. The published detector has thirty-eight stages and over six thousand readings, and a window rejected by its first stage skips essentially all of them, which is where the famous numbers come from.
                </p>
</>
                <p>The last row counts exhaustive feature evaluation at every position: 31,290,600 feature reads, compared with the fitted cascade&rsquo;s 6,657. It illustrates how much work selection and early exit remove from that exhaustive computation. It does not show that evaluating every feature would be a sensible classifier or achieve the same error rates.</p>
                <InAModel>
                  <p>The fit samples 600 candidates from the 10,344 possible features and selects five rules from them. At inference, retaining only those rules avoids evaluating the rest of the bank. Staging then reduces their average use from five rules to about 2.2 per scanned window. Feature selection happens during fitting, but both savings benefit each later search.</p>
                </InAModel>
              </SubSection>

              <SubSection title="22. What three stages still let through">
                <p>

                  Of the 3,025 windows, 111 survive all three stages, and all
                  three planted targets are among them. Twenty-eight of the 111
                  sit within two pixels of one of those targets, which is the
                  same target accepted several times over at neighboring
                  offsets, and the other 83 are patches of ground that happen to
                  be brighter across their middle than above and below it.
                </p>
                <>
<p>The three-stage detector still accepts many clutter windows in this scene. That is a limitation of this fit, not a requirement that every three-stage cascade behave this way. Additional stages may reject more backgrounds if useful distinctions and suitable training examples remain. Their target-retention losses and extra work must be measured too.</p>
                <p>Detectors commonly combine overlapping accepted windows into object-level detections, using a grouping or suppression rule. This example leaves all windows visible. A grouping rule could consolidate many of the 28 acceptances near the planted targets, but its settings would determine the final boxes and could also merge or miss detections.</p>
</>
                <KeepInMind>
                  <p>The number of stages survived reports which tests a window passed. It can provide a ranking in a particular detector, but it is not a calibrated target probability. Stage thresholds are chosen for rejection behavior, and surviving more tests does not establish a universal measure of resemblance.</p>
                </KeepInMind>
              </SubSection>
            </>
          ),
        },
        {
          title: "Part 6. What Rectangle Features and the Cascade Can Miss" , id: "part-6-where-the-method-stops-being-defined",
          content: (
            <>
              <SubSection title="23. A signed reading says nothing about its mirror">
                <>
<p>A rectangle feature has signed weights, so reversing brightness can change both its sign and its magnitude. A balanced feature changes sign under contrast reversal. An unbalanced feature also responds to the added constant in the reversal. A one-sided threshold trained on bright bands does not automatically accept the corresponding dark bands.</p>
                <p>One threshold on a signed feature accepts only one side of that threshold. Accepting both contrast polarities may require additional rules or a different feature, such as an absolute contrast. The family can be extended or trained for both cases; the fitted detector here was not.</p>
</>
                <p>In the pose check, the detector accepts 0 of 50 contrast-reversed targets, compared with 43 of 50 fresh bright targets. The first rule gives −7.1856 on one target and 7.3344 on its reversed version. Its threshold accepts values at or below −2.6449, so only the original passes that rule.</p>
                <PoseGallery />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  The three panels are the same fifty targets presented three
                  ways. The two zeros are exact rather than rounded.
                </p>
              </SubSection>

              <SubSection title="24. Nor does an upright layout say anything about a turned one">
                <>
<p>Rotating a target also changes how it overlaps the fitted axis-aligned rectangles. A stacked-cell feature and a side-by-side feature measure different arrangements. Rules selected for horizontal bands may therefore respond poorly to vertical bands, as the next measurement shows.</p>
                <p>
                  The measurement is 0 of 50 again, on the same fifty targets with the band running down instead of across.
                </p>
</>
                <p>This fitted detector learned horizontal bright bands, so a rotated band can give different feature responses and fail its tests. Orientation coverage depends on the features and training examples. Separate pose-specific detectors are one practical approach; the measured failure here should not be treated as a theorem that every cascade must fail on every rotation.</p>
              </SubSection>

              <SubSection title="25. A scene that is mostly target is not fast">
                <p>Early-exit savings depend on both the detector and the scenes it scans. If many windows pass the early stages, more reach the expensive later checks. A scene rich in accepted patterns can therefore cost more than an otherwise similar background scene.</p>
                <SceneCostComparison />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  The same detector, the same ground, and the only difference is
                  how much of each scene is target. Watch the average cost climb
                  towards the ceiling of five rules a window.
                </p>
                <>
<p>The average cost is 2.1597 rule evaluations on clutter alone, 2.2007 with three planted targets, and 2.6552 on the scene tiled with targets. The reduction relative to always evaluating five rules falls from a factor of 2.315 to 1.883. Even the tiled scene still rejects many overlapping windows early, so it does not reach the five-rule ceiling.</p>
                <p>If every scanned window passed every stage, all five rules would run. Early-exit bookkeeping would then add overhead without saving any feature evaluations. The measurements above show a trend toward that limit, not a direct timing result proving a flat implementation faster.</p>
</>
              </SubSection>

              <SubSection title="26. What is learned is a fact about contrast">
                <p>The detector recognizes the rectangle-feature patterns selected during fitting. It has no independent knowledge of whether those patterns came from the intended band or from clutter. The 83 accepted windows away from the planted targets show that these learned tests are not sufficient to identify every band correctly.</p>
                <p>The detector can distinguish inputs only through its measured rectangle contrasts. If two inputs give identical responses for every feature used, its stages cannot separate them. More training can select different available tests, but it cannot make a fixed feature representation contain information it does not measure.</p>
              </SubSection>

              <SubSection title="27. The cases the definition does not reach">
                <p>
                  Some inputs leave the detector without the information it needs. Other cases require us to choose a policy. The table separates these cases and explains which choices affect the result.
                </p>
                <DerivationTable
                  expressionHeading="The case"
                  reasonHeading="What is undefined, or what has to be decided"
                  rows={[
                    {
                      expression: "A window one pixel square",
                      reason: "The smallest available layout needs two adjacent cells. A one-by-one window therefore has no candidate features, while a two-by-two window has 7. This trainer cannot fit from an empty feature bank.",
                    },
                    {
                      expression: "No reading separates the two classes",
                      reason: "If no candidate has weighted error below one half, no positive-weight first rule is selected. This SDK raises an error rather than returning an empty cascade, whose usual all-stages-pass interpretation would accept every window.",
                    },
                    {
                      expression: "A reading exactly equal to a threshold",
                      reason: "The trainer searches midpoints between distinct feature values. Evaluation still needs an equality convention for any value that lands on a threshold. Step 12 separately plants a threshold at a computed value to demonstrate how a 2.2e−16 rounding difference can switch a decision.",
                    },
                    {
                      expression: "A stage that rejects nothing",
                      reason: "This deterministic trainer stops when a stage rejects none of its training backgrounds, rather than repeating the same fitting problem with unchanged settings. Different data, features or training settings might permit further progress. In the shown run, fitting instead stops after stage 3 removes the last 3 backgrounds, before reaching the allowed 5 stages.",
                    },
                    {
                      expression: "Keeping every target, on unseen targets",
                      reason: "Retaining every training target does not guarantee perfect recall on new targets. On this fresh draw recall is 0.94 rather than 1.00, and all three missed targets are rejected at the first stage.",
                    },
                    {
                      expression: "A target at a different size",
                      reason: "A fixed-size feature need not respond similarly when the target changes size. The summed-area table keeps each scaled rectangle query inexpensive, but the detector still needs to search the chosen scales and evaluate whether its trained features transfer.",
                    },
                  ]}
                />
                <p>
                  A larger rectangle still needs four summed-area lookups. Scaling a feature therefore does not increase the lookup count for that feature. But each scale is another search to perform, and the number of valid window positions can differ by scale. The table speeds up rectangle totals; it does not find an object&apos;s scale for us.
                </p>
              </SubSection>
            </>
          ),
        },
        {
          title: "Questions on Parts 5 and 6",
          quiz: [
            choice(
              "Sweeping the fitted detector across the scene, 3,025 windows enter the first stage, 235 reach the second and 137 the third. What does a window cost on average?",
              [
                "About 2.2007 rules, which is also the 6,657 readings taken divided by the 3,025 windows",
                "Five rules, since the detector holds five",
                "About one rule, since nearly everything is rejected at the first stage",
                "About 2.27 rules, which is the factor the ordering saves",
              ],
              0,
              "Count each rule evaluation only for windows that reach its stage:\n\n```math\nfirst stage: 3,025 × 2 = 6,050\nsecond stage: 235 × 2 = 470\nthird stage: 137 × 1 = 137\ntotal = 6,657\nmean rules per window = 6,657 / 3,025 ≈ 2.2007\n```\n\nThis is an average feature-evaluation count. Per-stage overhead and feature costs also affect elapsed time.",
            ),
            choice(
              "Holding the rules fixed, the ordering is worth a factor of 2.27 here. Why is the famous figure so much larger?",
              [
                "A window rejected by the first stage here skips at most three rules, where the published detector has thirty-eight stages and over six thousand readings",
                "The published detector reads pixels directly rather than rectangles",
                "The published detector normalizes each window’s variance",
                "The scene here is too small for the ordering to apply at all",
              ],
              0,
              "The saving from ordering is bounded by how many rules there are to skip, and this cascade has five. Two separate savings are stacked and often conflated, since boosting is what takes 10,344 candidate readings down to five and happens once, where the ordering takes five rules a window down to 2.2 and happens on every window forever.",
            ),
            several(
              "Which of these does the page say about what the detector has learned?",
              [
                "It has learned that certain rectangles tend to be brighter than certain neighboring ones, which is a statement about contrast rather than about an object",
                "The 83 accepted windows of plain clutter are exactly what that buys",
                "Enough extra training would let it tell apart two things that agree on every rectangle contrast",
                "The share of stages a window survived is the probability that it holds a target",
              ],
              [0, 1],
              "The selected signed rectangle responses define what this fitted classifier can distinguish. Windows with identical selected responses receive identical decisions, regardless of their object identity. More training may select different features, but cannot distinguish inputs identical under every available feature. The fraction of stages passed is not a calibrated target probability; the cascade was trained to make successive accept/reject decisions.",
            ),
            choice(
              "On a target-dense scene the measured mean is 2.6552 rules per window, and stage overhead makes the flat all-rules implementation faster in the recorded timing. What follows for that measured regime?",
              [
                "At the ceiling the flat classifier is the better arrangement, since it does the same work without the per-window bookkeeping",
                "The cascade still wins, since 2.6552 is comfortably below five",
                "The detector should be refitted with more stages for that scene",
                "The stage shares are a property of the detector, so they can be tuned for it",
              ],
              0,
              "Early rejection saves fewer evaluations when many windows pass several stages. In this measured regime, the overhead outweighs those savings and the flat implementation is faster. The passing fractions depend on both the fitted detector and the scene. Comparing counts and elapsed time on representative inputs is more useful than assuming cascades always improve runtime.",
            ),
            choice(
              "Fifty of the same targets with bright and dark exchanged are found 0 of 50, where fresh upright ones are found 43 of 50. Why?",
              [
                "Every reading in the family is signed and every rule has a direction, so the exchanged pattern is rejected outright",
                "The exchanged targets are dimmer, so they fall below every threshold",
                "The window variance was not normalized, so the readings drift",
                "Boosting weighted the upright targets more heavily than the rest",
              ],
              0,
              "The first rule’s layout answers −7.1856 on one target and 7.3344 on that same target relit, and the rule votes yes at or below −2.6449. Turning the band a quarter measures 0 of 50 as well, by a different route, since the layouts are axis-aligned and the evidence moves into readings the fitted rules never look at, which is why real implementations fit one cascade per pose.",
            ),
        ],
        },
        {
          title: "Practice. Reading A Box, A Layout And A Fitted Cascade",
          practice: [
            exercise("Read two boxes off the table",["Build the six by seven picture of Part 2, whose pixel at row r and column c is 10r + c, and its table of running totals. Read the three by three box that starts at row one, column two, printing the four entries the read names, the sign each enters with, and the total. Then do the same for the two by two box in the picture’s bottom-right corner, and add that box’s four pixels up directly as a check.", "Compare the four-entry lookup with the direct pixel sum for each rectangle. Check that the corner rectangle uses the same rule even though it reaches the bottom and right image boundaries."],`from oop_ml.core.computer_vision.cascade import IntegralImage, Rectangle
from oop_ml.core.computer_vision.picture import Picture

picture = Picture([[10.0 * row + column for column in range(7)] for row in range(6)])
table = IntegralImage.of(picture)

boxes = {"worked": Rectangle(1, 2, 3, 3), "corner": Rectangle(4, 5, 2, 2)}
# For each box, ask the table for its four corners and print each one's row,
# column, sign and the table's entry there. Then print the total the table
# gives for the box, and the total of the same pixels added up directly.

# Print the corner box's total on a line of its own.`,`from oop_ml.core.computer_vision.cascade import IntegralImage, Rectangle
from oop_ml.core.computer_vision.picture import Picture

picture = Picture([[10.0 * row + column for column in range(7)] for row in range(6)])
table = IntegralImage.of(picture)

boxes = {"worked": Rectangle(1, 2, 3, 3), "corner": Rectangle(4, 5, 2, 2)}
for name, box in boxes.items():
    print(name)
    for corner in table.corners_for(box):
        entry = table.table[corner.row, corner.column]
        print(f"  table[{corner.row}, {corner.column}] = {entry:.0f}, sign {corner.sign:+d}")
    pixels = picture.values[box.top : box.bottom, box.left : box.right]
    print(f"  from the table {table.sum_over(box):.0f}, from the pixels {pixels.sum():.0f}")

print(f"corner box total: {table.sum_over(boxes['corner']):.0f}")`,`worked
  table[4, 5] = 340, sign +1
  table[1, 5] = 10, sign -1
  table[4, 2] = 124, sign -1
  table[1, 2] = 1, sign +1
  from the table 207, from the pixels 207
corner
  table[6, 7] = 1176, sign +1
  table[4, 7] = 504, sign -1
  table[6, 5] = 810, sign -1
  table[4, 5] = 340, sign +1
  from the table 202, from the pixels 202
corner box total: 202`,{...{ hints: ["A Rectangle is its top row, its left column, its height and its width. corners_for takes one and answers the four lookups a read of it makes, each with a row, a column and a sign.", "The table itself is on the IntegralImage as table. It is one row and one column larger than the picture, so its indices are the picture’s shifted by the border of zeros.", "sum_over does the four reads for you. A box also knows its bottom and its right, one past its last row and column, which is exactly what a slice of the picture’s values wants."], check: numberCheck("What do the four pixels of the corner box total?", 202, 0.5, "The upper-left integral-image region was removed by both subtractions, so it must be restored once. The rectangle read and direct sum agree, checking the boundary convention as well as the four signs.") },question:"Can four integral-image entries recover each rectangle's pixel total?"}),
            exercise("Predict five readings on a picture with nothing in it",["Part 3 says two of the five layouts read the lamp as well as the picture. Take a flat six by six picture, read each of the five layouts on it with cells two pixels on a side, and do it at two brightnesses, 0.6 and 0.9.", "Before running it, use Part 3’s expression for a flat picture, the pixels in one cell times the brightness times the sum of the cell signs, to predict all ten numbers. The lesson measures one-pixel cells and these are four-pixel cells, so its −0.25 and −0.9 will not be what comes back."],`import numpy as np
from oop_ml.core.computer_vision.cascade import (
    FeatureArrangement,
    IntegralImage,
    Rectangle,
    RectangleFeature,
)
from oop_ml.core.computer_vision.picture import Picture

window = Rectangle(0, 0, 6, 6)
for brightness in (0.6, 0.9):
    table = IntegralImage.of(Picture(np.full((6, 6), brightness)))
    print(f"brightness {brightness}")
    # Loop over the five members of FeatureArrangement. Build a
    # RectangleFeature of each at the window's top-left corner with cells two
    # tall and two wide, and print its value in the window to four places.

# Print the three-cell column's reading at 0.6 on a line of its own.`,`import numpy as np
from oop_ml.core.computer_vision.cascade import (
    FeatureArrangement,
    IntegralImage,
    Rectangle,
    RectangleFeature,
)
from oop_ml.core.computer_vision.picture import Picture

window = Rectangle(0, 0, 6, 6)
readings = {}
for brightness in (0.6, 0.9):
    table = IntegralImage.of(Picture(np.full((6, 6), brightness)))
    print(f"brightness {brightness}")
    for arrangement in FeatureArrangement:
        feature = RectangleFeature(arrangement, 0, 0, 2, 2)
        value = round(feature.value_in(table, window), 4) + 0.0
        readings[brightness, arrangement] = value
        print(f"  {arrangement.value}: {feature.n_cells} cells, reading {value:.4f}")

column = readings[0.6, FeatureArrangement.THREE_VERTICAL]
print(f"three cells in a column at 0.6: {column:.4f}")`,`brightness 0.6
  two_horizontal: 2 cells, reading 0.0000
  two_vertical: 2 cells, reading 0.0000
  three_horizontal: 3 cells, reading -2.4000
  three_vertical: 3 cells, reading -2.4000
  four_chequer: 4 cells, reading 0.0000
brightness 0.9
  two_horizontal: 2 cells, reading 0.0000
  two_vertical: 2 cells, reading 0.0000
  three_horizontal: 3 cells, reading -3.6000
  three_vertical: 3 cells, reading -3.6000
  four_chequer: 4 cells, reading 0.0000
three cells in a column at 0.6: -2.4000`,{...{ hints: ["FeatureArrangement is a closed set of five, and looping over the class itself visits each member. A RectangleFeature takes the arrangement, then the row and column of its top-left corner inside the window, then the height and width of one cell.", "value_in takes the table and the window the feature sits in. The window here is the whole picture, a Rectangle starting at row zero, column zero.", "A total that should be exactly zero can come back as a zero with a minus sign in front. Rounding and then adding 0.0 prints it as a plain zero."], check: numberCheck("What does the three-cell column read on the flat picture at 0.6, to four places?", -2.4, 0.0005, "This layout has unequal total positive and negative rectangle area, so a flat image produces a nonzero response that changes with brightness. Balanced layouts cancel uniform brightness instead.") },question:"Which rectangle features respond to a flat picture's brightness?"}),
            exercise("Fit the cascade and read its stages",["The starter creates fifty bright-band target windows and two thousand clutter windows. Fit HaarCascade with at most five stages, two rules per stage and six hundred candidate rectangle features. Print the fitted stage and rule counts, then each stage's incoming backgrounds, rejected backgrounds and retained targets.", "For each stage, print every rule's vote weight, stored as voice, and its fraction of total_voice. Compare how backgrounds are removed across stages and which weighted rule combinations can pass."],`import numpy as np
from oop_ml import Feature
from oop_ml.core.computer_vision.cascade import HaarCascade
from oop_ml.core.computer_vision.picture import Picture

generator = np.random.default_rng(7)
pictures = []
for index in range(2050):
    values = np.full((12, 12), 0.25)
    if index < 50:
        top = 4 + int(generator.integers(-1, 2))
        values[top : top + 4, :] = 0.85
    ground = np.kron(generator.uniform(0.15, 0.85, (4, 4)), np.ones((3, 3)))
    mixed = 0.55 * values + 0.45 * ground if index < 50 else ground
    speckle = generator.normal(0.0, 0.05, (12, 12))
    pictures.append(Picture(np.clip(mixed + speckle, 0.0, 1.0)))
labels = Feature("target", [1.0] * 50 + [0.0] * 2000)

cascade = HaarCascade(n_stages=5, rules_per_stage=2, n_candidate_features=600, random_seed=0)
# Fit the cascade to the pictures and labels. Print how many stages and rules
# it kept. Then pair each stage with its outcome and print how many
# backgrounds reached it, how many it rejected and how many targets it kept,
# and under that each rule's voice and its share of the stage's total voice.

# Print how many backgrounds the first stage rejected on a line of its own.`,`import numpy as np
from oop_ml import Feature
from oop_ml.core.computer_vision.cascade import HaarCascade
from oop_ml.core.computer_vision.picture import Picture

generator = np.random.default_rng(7)
pictures = []
for index in range(2050):
    values = np.full((12, 12), 0.25)
    if index < 50:
        top = 4 + int(generator.integers(-1, 2))
        values[top : top + 4, :] = 0.85
    ground = np.kron(generator.uniform(0.15, 0.85, (4, 4)), np.ones((3, 3)))
    mixed = 0.55 * values + 0.45 * ground if index < 50 else ground
    speckle = generator.normal(0.0, 0.05, (12, 12))
    pictures.append(Picture(np.clip(mixed + speckle, 0.0, 1.0)))
labels = Feature("target", [1.0] * 50 + [0.0] * 2000)

cascade = HaarCascade(n_stages=5, rules_per_stage=2, n_candidate_features=600, random_seed=0)
cascade.fit(pictures, labels)

print(f"{cascade.n_stages_fitted} stages, {cascade.n_rules} rules")
for stage, outcome in zip(cascade.stages, cascade.stage_outcomes):
    print(f"stage {outcome.stage_number}: {outcome.negatives_reaching} backgrounds in, "
          f"{outcome.negatives_rejected} rejected, {outcome.positives_kept} targets kept")
    for weighted in stage.weighted_rules:
        share = weighted.voice / stage.total_voice
        print(f"  voice {weighted.voice:.4f}, share of the stage {share:.4f}")

print(f"first stage rejected: {cascade.stage_outcomes[0].negatives_rejected}")`,`3 stages, 5 rules
stage 1: 2000 backgrounds in, 1895 rejected, 50 targets kept
  voice 1.8067, share of the stage 0.5355
  voice 1.5669, share of the stage 0.4645
stage 2: 105 backgrounds in, 102 rejected, 50 targets kept
  voice 2.1171, share of the stage 0.5121
  voice 2.0171, share of the stage 0.4879
stage 3: 3 backgrounds in, 3 rejected, 50 targets kept
  voice 1.0000, share of the stage 1.0000
first stage rejected: 1895`,{...{ hints: ["fit takes the list of pictures and the label feature, the same shape of call as every other model in the library, and what was learned is read off properties afterwards.", "stages and stage_outcomes run in step, one outcome per stage. An outcome carries negatives_reaching, negatives_rejected, negatives_surviving and positives_kept.", "A stage’s rules are its weighted_rules, each with a voice, and the stage knows its total_voice. Dividing one by the other is the share a window attracts when that rule alone says yes."], check: numberCheck("How many of the 2,000 training backgrounds does the first stage reject?", 1895, 0.5, "The first stage removes most training backgrounds, leaving a smaller, harder set for the next stage. The per-rule voice shares explain which combinations can reach that stage's acceptance threshold.") },question:"How does each fitted cascade stage change the surviving windows?"}),
            exercise("Score the detector on windows it never saw",["Draw three sets of windows the same way, from seeds 7, 99 and 11. Fit the cascade on the first, which is the training set, and evaluate it on the other two. Seed 99 is the fresh draw of Part 4. Seed 11 is one the lesson never looks at.", "Print accuracy, recall and precision for the two held-out draws. Compare how much each metric changes when target detections are missed among many background windows. Keeping all training targets does not guarantee perfect recall on new ones."],`import numpy as np
from oop_ml import Feature
from oop_ml.core.computer_vision.cascade import HaarCascade
from oop_ml.core.computer_vision.picture import Picture

draws = {}
for seed in (7, 99, 11):
    generator = np.random.default_rng(seed)
    draws[seed] = []
    for index in range(2050):
        values = np.full((12, 12), 0.25)
        if index < 50:
            top = 4 + int(generator.integers(-1, 2))
            values[top : top + 4, :] = 0.85
        ground = np.kron(generator.uniform(0.15, 0.85, (4, 4)), np.ones((3, 3)))
        mixed = 0.55 * values + 0.45 * ground if index < 50 else ground
        speckle = generator.normal(0.0, 0.05, (12, 12))
        draws[seed].append(Picture(np.clip(mixed + speckle, 0.0, 1.0)))
labels = Feature("target", [1.0] * 50 + [0.0] * 2000)

cascade = HaarCascade(n_stages=5, rules_per_stage=2, n_candidate_features=600, random_seed=0)
# Fit on the draw from seed 7. Evaluate on the draws from seeds 99 and 11 and
# print the accuracy, recall and precision of each to four places.

# Print the recall on the draw from seed 11 on a line of its own, to two places.`,`import numpy as np
from oop_ml import Feature
from oop_ml.core.computer_vision.cascade import HaarCascade
from oop_ml.core.computer_vision.picture import Picture

draws = {}
for seed in (7, 99, 11):
    generator = np.random.default_rng(seed)
    draws[seed] = []
    for index in range(2050):
        values = np.full((12, 12), 0.25)
        if index < 50:
            top = 4 + int(generator.integers(-1, 2))
            values[top : top + 4, :] = 0.85
        ground = np.kron(generator.uniform(0.15, 0.85, (4, 4)), np.ones((3, 3)))
        mixed = 0.55 * values + 0.45 * ground if index < 50 else ground
        speckle = generator.normal(0.0, 0.05, (12, 12))
        draws[seed].append(Picture(np.clip(mixed + speckle, 0.0, 1.0)))
labels = Feature("target", [1.0] * 50 + [0.0] * 2000)

cascade = HaarCascade(n_stages=5, rules_per_stage=2, n_candidate_features=600, random_seed=0)
cascade.fit(draws[7], labels)

for seed in (99, 11):
    evaluation = cascade.evaluate(draws[seed], labels)
    print(f"seed {seed}: accuracy {evaluation.accuracy:.4f}, "
          f"recall {evaluation.recall:.4f}, precision {evaluation.precision:.4f}")

print(f"recall on the draw from seed 11: {evaluation.recall:.2f}")`,`seed 99: accuracy 0.9980, recall 0.9400, precision 0.9792
seed 11: accuracy 0.9971, recall 0.9000, precision 0.9783
recall on the draw from seed 11: 0.90`,{...{ hints: ["evaluate takes pictures and labels, predicts once, and answers an object that has already paired every prediction with its truth. accuracy, recall and precision are properties of that object.", "The same labels serve all three draws, since every draw is fifty targets followed by two thousand backgrounds in that order."], check: numberCheck("What recall does the detector score on the draw from seed 11, to two places?", 0.9, 0.005, "The new draw contains targets the fitted cascade never saw. Recall falls while accuracy changes little because backgrounds greatly outnumber targets; keeping training targets did not promise the same recall on fresh windows.") },question:"Does keeping every training target imply perfect recall on fresh windows?"}),
          ],
        },
      ]}
    />
  );
}
